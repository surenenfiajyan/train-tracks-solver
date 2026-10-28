const fromL = { 't': 'dr', 'd': 'tr', 'r': 'lr' };
const fromR = { 't': 'dl', 'd': 'tl', 'l': 'lr' };
const fromT = { 'r': 'dl', 'd': 'td', 'l': 'dr' };
const fromD = { 'r': 'tl', 't': 'td', 'l': 'tr' };


const neighboursOfL = ['tl', 'lr', 'dl'];
const neighboursOfR = ['tr', 'lr', 'dr'];
const neighboursOfT = ['td', 'tr', 'tl'];
const neighboursOfD = ['td', 'dr', 'dl'];

let storedTracks = null;
let recursiveCalls = 0;
let depth = 0;

const directionData = {
	't': {
		fromMap: fromT,
		neighbours: neighboursOfT,
		opposite: 'd',
		long: 'top',
		next: 'r',
	},
	'r': {
		fromMap: fromR,
		neighbours: neighboursOfR,
		opposite: 'l',
		long: 'right',
		next: 'd',
	},
	'd': {
		fromMap: fromD,
		neighbours: neighboursOfD,
		opposite: 't',
		long: 'down',
		next: 'l',
	},
	'l': {
		fromMap: fromL,
		neighbours: neighboursOfL,
		opposite: 'r',
		long: 'left',
		next: 't',
	},
};

function solveRecursively(currentEntry, endEntry, tracksToAdd, tracksToConnect, from = null) {
	const minDistance = Math.abs(currentEntry.x - endEntry.x) + Math.abs(currentEntry.y - endEntry.y);
	const remainingTracks = tracksToAdd + tracksToConnect;

	if (minDistance >= remainingTracks || (remainingTracks - minDistance) % 2 === 0) {
		return;
	}

	++depth;
	++recursiveCalls;
	const shouldPutWalls = tracksToAdd > 10;

	if (shouldPutWalls) {
		if (putWalls() < 0) {
			restoreWalls();
			return;
		}
	}

	if (tracksToAdd > 0 && currentEntry.isEmpty && currentEntry.xCount.value > 0 && currentEntry.yCount.value > 0) {
		currentEntry.isEmpty = false;
		currentEntry.isTrack = true;
		currentEntry.isWall = true;
		--currentEntry.xCount.value;
		--currentEntry.yCount.value;
		--tracksToAdd;

		let direction = from;

		do {
			const { opposite, long, next } = directionData[direction];

			if (from !== opposite) {
				const neighbour = currentEntry[long];
				const { neighbours, fromMap } = directionData[opposite];

				if (
					neighbour !== null &&
					(neighbour.isEmpty || !neighbour.isWall && neighbours.includes(neighbour.value))
				) {
					currentEntry.value = fromMap[from];
					solveRecursively(neighbour, endEntry, tracksToAdd, tracksToConnect, direction);
				}
			}

			direction = next;
		} while (direction !== from);

		currentEntry.value = null;
		++tracksToAdd;
		++currentEntry.yCount.value;
		++currentEntry.xCount.value;
		currentEntry.isWall = false;
		currentEntry.isTrack = false;
		currentEntry.isEmpty = true;
	} else if (tracksToConnect > 0 && !currentEntry.isWall && currentEntry.isTrack) {
		currentEntry = currentEntry.oppositeEnd;
		currentEntry.oppositeEnd.isWall = currentEntry.isWall = true;
		tracksToConnect -= currentEntry.groupCount;

		if (currentEntry !== endEntry) {
			switch (currentEntry.value) {
				case 'lr':
					if (currentEntry.left?.isEmpty) {
						solveRecursively(currentEntry.left, endEntry, tracksToAdd, tracksToConnect, 'l');
					} else if (currentEntry.right?.isEmpty) {
						solveRecursively(currentEntry.right, endEntry, tracksToAdd, tracksToConnect, 'r');
					}

					break;
				case 'td':
					if (currentEntry.top?.isEmpty) {
						solveRecursively(currentEntry.top, endEntry, tracksToAdd, tracksToConnect, 't');
					} else if (currentEntry.down?.isEmpty) {
						solveRecursively(currentEntry.down, endEntry, tracksToAdd, tracksToConnect, 'd');
					}

					break;
				case 'tl':
					if (currentEntry.top?.isEmpty) {
						solveRecursively(currentEntry.top, endEntry, tracksToAdd, tracksToConnect, 't');
					} else if (currentEntry.left?.isEmpty) {
						solveRecursively(currentEntry.left, endEntry, tracksToAdd, tracksToConnect, 'l');
					}

					break;
				case 'tr':
					if (currentEntry.top?.isEmpty) {
						solveRecursively(currentEntry.top, endEntry, tracksToAdd, tracksToConnect, 't');
					} else if (currentEntry.right?.isEmpty) {
						solveRecursively(currentEntry.right, endEntry, tracksToAdd, tracksToConnect, 'r');
					}

					break;
				case 'dl':
					if (currentEntry.down?.isEmpty) {
						solveRecursively(currentEntry.down, endEntry, tracksToAdd, tracksToConnect, 'd');
					} else if (currentEntry.left?.isEmpty) {
						solveRecursively(currentEntry.left, endEntry, tracksToAdd, tracksToConnect, 'l');
					}

					break;
				case 'dr':
					if (currentEntry.down?.isEmpty) {
						solveRecursively(currentEntry.down, endEntry, tracksToAdd, tracksToConnect, 'd');
					} else if (currentEntry.right?.isEmpty) {
						solveRecursively(currentEntry.right, endEntry, tracksToAdd, tracksToConnect, 'r');
					}

					break;
			}
		} else if (tracksToConnect === 0 && tracksToAdd === 0) {
			throw 'solved';
		}

		tracksToConnect += currentEntry.groupCount;
		currentEntry.oppositeEnd.isWall = currentEntry.isWall = false;
	}

	///*
	--depth;

	if (shouldPutWalls) {
		restoreWalls();
	}
	//*/
}

const oldVersionsOfTracksData = [];

function restoreWalls() {
	const oldTracksData = oldVersionsOfTracksData.pop();

	if (oldTracksData) {
		for (let i = 0; i < oldTracksData.length; ++i) {
			for (let j = 0; j < oldTracksData[i].length; ++j) {
				storedTracks[i][j].isWall = oldTracksData[i][j].isWall;
				storedTracks[i][j].isEmpty ||= !storedTracks[i][j].isWall && !storedTracks[i][j].isTrack;
			}
		}
	}
}

function putWalls(savePermanently = false) {
	let addedTracks = 0;
	let oldTracksData;

	if (!savePermanently) {
		oldTracksData = storedTracks.map(r => r.map(t => ({
			isWall: t.isWall,
			isTrack: t.isTrack,
			isEmpty: t.isEmpty,
			value: t.value,
			xCountValue: t.xCount.value,
			yCountValue: t.yCount.value,

		})));
		oldVersionsOfTracksData.push(oldTracksData);
	}

	const cornerTrack = storedTracks[0][0];
	let repeat;

	const height = storedTracks.length;
	const width = storedTracks[0].length;

	function closeUnreachableAreas(tracks) {
		const visited = new Set();

		for (let i = 0; i < tracks.length; ++i) {
			for (let j = 0; j < tracks[i].length; ++j) {
				const track = tracks[i][j];

				if (track.isEmpty && !visited.has(track)) {
					let queue = [track];
					const candidates = [track];
					let entries = 0;

					do {
						const newQueue = [];

						for (const t of queue) {
							if (visited.has(t)) {
								continue;
							}

							visited.add(t);

							if (t.isEmpty) {
								candidates.push(t);

								if (!isTopBlocked(t)) {
									newQueue.push(t.top);
								}

								if (!isDownBlocked(t)) {
									newQueue.push(t.down);
								}

								if (!isLeftBlocked(t)) {
									newQueue.push(t.left);
								}

								if (!isRightBlocked(t)) {
									newQueue.push(t.right);
								}
							} else if (t.isTrack) {
								if (t.value.includes('t')) {
									if (t.top) {
										newQueue.push(t.top);
									} else {
										++entries;
									}
								}

								if (t.value.includes('d')) {
									if (t.down) {
										newQueue.push(t.down);
									} else {
										++entries;
									}
								}

								if (t.value.includes('l')) {
									if (t.left) {
										newQueue.push(t.left);
									} else {
										++entries;
									}
								}

								if (t.value.includes('r')) {
									if (t.right) {
										newQueue.push(t.right);
									} else {
										++entries;
									}
								}
							}
						}

						queue = newQueue;
					} while (queue.length);

					if (entries < 2) {
						for (const candidate of candidates) {
							candidate.isEmpty = false;
							candidate.isWall = true;
						}
					}
				}
			}
		}
	}

	function isTopBlocked(t) {
		return !t.top || t.top.isWall && !t.top.isTrack || t.top.isTrack && !t.top.value.includes('d');
	}

	function isDownBlocked(t) {
		return !t.down || t.down.isWall && !t.down.isTrack || t.down.isTrack && !t.down.value.includes('t');
	}

	function isLeftBlocked(t) {
		return !t.left || t.left.isWall && !t.left.isTrack || t.left.isTrack && !t.left.value.includes('r');
	}

	function isRightBlocked(t) {
		return !t.right || t.right.isWall && !t.right.isTrack || t.right.isTrack && !t.right.value.includes('l');
	}

	function isSurrounded(t) {
		let surrounded = 0;

		if (isTopBlocked(t)) {
			++surrounded;
		}

		if (isDownBlocked(t)) {
			++surrounded;
		}

		if (isLeftBlocked(t)) {
			++surrounded;
		}

		if (isRightBlocked(t)) {
			++surrounded;
		}

		return surrounded > 2;
	}

	function getAdditionalHorizontalFills(t) {
		const topBlocked = isTopBlocked(t);
		const downBlocked = isDownBlocked(t);
		const leftBlocked = isLeftBlocked(t);
		const rightBlocked = isRightBlocked(t);

		if (topBlocked && downBlocked && !leftBlocked && !rightBlocked) {
			let ans = 2;

			if (!t.left?.isEmpty) {
				--ans;
			}

			if (!t.right?.isEmpty) {
				--ans;
			}

			return ans;
		} else if (topBlocked || downBlocked) {
			if (
				leftBlocked && t.right?.isEmpty ||
				rightBlocked && t.left?.isEmpty ||
				t.left?.isEmpty && t.right?.isEmpty
			) {
				return 1;
			}
		}

		return 0;
	}

	function getAdditionalVerticalFills(t) {
		const topBlocked = isTopBlocked(t);
		const downBlocked = isDownBlocked(t);
		const leftBlocked = isLeftBlocked(t);
		const rightBlocked = isRightBlocked(t);

		if (leftBlocked && rightBlocked && !topBlocked && !downBlocked) {
			let ans = 2;

			if (!t.top?.isEmpty) {
				--ans;
			}

			if (!t.down?.isEmpty) {
				--ans;
			}

			return ans;
		} else if (leftBlocked || rightBlocked) {
			if (
				topBlocked && t.down?.isEmpty ||
				downBlocked && t.top?.isEmpty ||
				t.top?.isEmpty && t.down?.isEmpty
			) {
				return 1;
			}
		}

		return 0;
	}

	function isTrackConnectionInvalid(t) {
		if (t.value.includes('t') && t.top?.isWall && !t.top.isTrack) {
			return true;
		}

		if (t.value.includes('d') && t.down?.isWall && !t.down.isTrack) {
			return true;
		}

		if (t.value.includes('l') && t.left?.isWall && !t.left.isTrack) {
			return true;
		}

		if (t.value.includes('r') && t.right?.isWall && !t.right.isTrack) {
			return true;
		}

		return false;
	}

	function getFillStatus(t, isPresent) {
		let
			topNeightbour = false, topBlocked = false,
			downNeightbour = false, downBlocked = false,
			leftNeightbour = false, leftBlocked = false,
			rightNeightbour = false, rightBlocked = false;

		if (isTopBlocked(t)) {
			topBlocked = true;
		} else if (t.top && t.top.isTrack && t.top.value.includes('d')) {
			topNeightbour = true;
		}

		if (isDownBlocked(t)) {
			downBlocked = true;
		} else if (t.down && t.down.isTrack && t.down.value.includes('t')) {
			downNeightbour = true;
		}

		if (isLeftBlocked(t)) {
			leftBlocked = true;
		} else if (t.left && t.left.isTrack && t.left.value.includes('r')) {
			leftNeightbour = true;
		}

		if (isRightBlocked(t)) {
			rightBlocked = true;
		} else if (t.right && t.right.isTrack && t.right.value.includes('l')) {
			rightNeightbour = true;
		}

		if (isPresent) {
			if (topBlocked && downBlocked) {
				return 'lr';
			}

			if (leftBlocked && rightBlocked) {
				return 'td';
			}

			if (topBlocked) {
				if (rightBlocked) {
					return 'dl';
				}

				if (leftBlocked) {
					return 'dr';
				}
			}

			if (downBlocked) {
				if (rightBlocked) {
					return 'tl';
				}

				if (leftBlocked) {
					return 'tr';
				}
			}
		}

		if (topBlocked && downBlocked && (leftNeightbour || rightNeightbour)) {
			leftNeightbour = rightNeightbour = true;
		}

		if (leftBlocked && rightBlocked && (topNeightbour || downNeightbour)) {
			topNeightbour = downNeightbour = true;
		}

		if (leftBlocked && topBlocked && (rightNeightbour || downNeightbour)) {
			rightNeightbour = downNeightbour = true;
		}

		if (rightBlocked && topBlocked && (leftNeightbour || downNeightbour)) {
			leftNeightbour = downNeightbour = true;
		}

		if (rightBlocked && downBlocked && (leftNeightbour || topNeightbour)) {
			leftNeightbour = topNeightbour = true;
		}

		if (leftBlocked && downBlocked && (rightNeightbour || topNeightbour)) {
			rightNeightbour = topNeightbour = true;
		}

		if (leftNeightbour && rightNeightbour) {
			return 'lr';
		}

		if (topNeightbour && downNeightbour) {
			return 'td';
		}

		if (topNeightbour && leftNeightbour) {
			return 'tl';
		}

		if (downNeightbour && leftNeightbour) {
			return 'dl';
		}

		if (topNeightbour && rightNeightbour) {
			return 'tr';
		}

		if (downNeightbour && rightNeightbour) {
			return 'dr';
		}

		return topNeightbour || downNeightbour || leftNeightbour || rightNeightbour || isPresent;
	}

	function stichTrack(t) {
		const ends = [];

		if (t.value.includes('t') && t.top?.isTrack) {
			ends.push(t.top.oppositeEnd);
		}

		if (t.value.includes('d') && t.down?.isTrack) {
			ends.push(t.down.oppositeEnd);
		}

		if (t.value.includes('l') && t.left?.isTrack) {
			ends.push(t.left.oppositeEnd);
		}

		if (t.value.includes('r') && t.right?.isTrack) {
			ends.push(t.right.oppositeEnd);
		}

		if (ends.length === 2) {
			const groupCount = ends[0].groupCount + ends[1].groupCount + 1;
			ends[0].oppositeEnd = ends[1];
			ends[1].oppositeEnd = ends[0];
			ends[0].groupCount = ends[1].groupCount = groupCount;
		} else if (ends.length === 1) {
			const groupCount = ends[0].groupCount + 1;
			t.oppositeEnd = ends[0];
			ends[0].oppositeEnd = t;
			t.groupCount = ends[0].groupCount = groupCount;
		} else {
			t.oppositeEnd = t;
		}
	}

	const abstractOccurredTracks = new WeakSet();

	outerLoop:
	do {
		repeat = false;
		closeUnreachableAreas(storedTracks);

		for (let rowStart = cornerTrack; rowStart; rowStart = rowStart.down) {
			const emptyTracksWithNoFillEvidence = [];
			let expectedTrackCount = rowStart.yCount.value, walls = 0, occurredTracks = 0;

			for (let track = rowStart; track; track = track.right) {
				/////////////////////////////////
				if (!track.isEmpty) {
					if (track.isTrack) {
						if (isTrackConnectionInvalid(track)) {
							addedTracks = Number.NEGATIVE_INFINITY;
							break outerLoop;
						}

						++expectedTrackCount;
						++occurredTracks;
					} else {
						++walls;
					}

					continue;
				}

				if (isSurrounded(track)) {
					repeat = true;
					track.isEmpty = false;
					track.isWall = true;
					++walls;
					continue;
				}

				const fillStatus = getFillStatus(track, abstractOccurredTracks.has(track));

				if (!fillStatus) {
					emptyTracksWithNoFillEvidence.push(track);
				} else if (fillStatus !== true) {
					if (fillStatus.includes('l') && emptyTracksWithNoFillEvidence.at(-1) === track.left) {
						emptyTracksWithNoFillEvidence.pop();
					}

					repeat = true;
					track.value = fillStatus;
					track.isTrack = true;
					track.isEmpty = false;
					--track.xCount.value;
					--track.yCount.value;
					++occurredTracks;
					abstractOccurredTracks.delete(track);

					if (savePermanently) {
						++addedTracks;
						stichTrack(track);
					}
				} else {
					++occurredTracks;

					if (!abstractOccurredTracks.has(track)) {
						abstractOccurredTracks.add(track);
						repeat = true;
					}
				}
			}

			if (width - walls < expectedTrackCount) {
				addedTracks = Number.NEGATIVE_INFINITY;
				break outerLoop;
			}

			if (width - walls === expectedTrackCount) {
				for (const t of emptyTracksWithNoFillEvidence) {
					if (!abstractOccurredTracks.has(t)) {
						abstractOccurredTracks.add(t);
						repeat = true;
					}
				}
			}

			if (emptyTracksWithNoFillEvidence.length === width - expectedTrackCount - walls || expectedTrackCount === occurredTracks) {
				for (const t of emptyTracksWithNoFillEvidence) {
					repeat = true;
					t.isEmpty = false;
					t.isWall = true;
				}

				continue;
			}

			for (const t of emptyTracksWithNoFillEvidence) {
				if (
					!abstractOccurredTracks.has(t.left) &&
					!abstractOccurredTracks.has(t.right) &&
					occurredTracks + 1 + getAdditionalHorizontalFills(t) > expectedTrackCount
				) {
					repeat = true;
					t.isEmpty = false;
					t.isWall = true;
				}
			}
		}

		for (let colStart = cornerTrack; colStart; colStart = colStart.right) {
			const emptyTracksWithNoFillEvidence = [];
			let expectedTrackCount = colStart.xCount.value, walls = 0, occurredTracks = 0;

			for (let track = colStart; track; track = track.down) {
				/////////////////////////////////
				if (!track.isEmpty) {
					if (track.isTrack) {
						if (isTrackConnectionInvalid(track)) {
							addedTracks = Number.NEGATIVE_INFINITY;
							break outerLoop;
						}

						++expectedTrackCount;
						++occurredTracks;
					} else {
						++walls;
					}

					continue;
				}

				if (isSurrounded(track)) {
					repeat = true;
					track.isEmpty = false;
					track.isWall = true;
					++walls;
					continue;
				}

				const fillStatus = getFillStatus(track, abstractOccurredTracks.has(track));

				if (!fillStatus) {
					emptyTracksWithNoFillEvidence.push(track);
				} else if (fillStatus !== true) {
					if (fillStatus.includes('t') && emptyTracksWithNoFillEvidence.at(-1) === track.top) {
						emptyTracksWithNoFillEvidence.pop();
					}

					repeat = true;
					track.value = fillStatus;
					track.isTrack = true;
					track.isEmpty = false;
					--track.xCount.value;
					--track.yCount.value;
					++occurredTracks;
					abstractOccurredTracks.delete(track);

					if (savePermanently) {
						++addedTracks;
						stichTrack(track);
					}
				} else {
					++occurredTracks;

					if (!abstractOccurredTracks.has(track)) {
						abstractOccurredTracks.add(track);
						repeat = true;
					}
				}
			}

			if (height - walls < expectedTrackCount) {
				addedTracks = Number.NEGATIVE_INFINITY;
				break outerLoop;
			}

			if (height - walls === expectedTrackCount) {
				for (const t of emptyTracksWithNoFillEvidence) {
					if (!abstractOccurredTracks.has(t)) {
						abstractOccurredTracks.add(t);
						repeat = true;
					}
				}
			}

			if (emptyTracksWithNoFillEvidence.length === height - expectedTrackCount - walls || expectedTrackCount === occurredTracks) {
				for (const t of emptyTracksWithNoFillEvidence) {
					repeat = true;
					t.isEmpty = false;
					t.isWall = true;
				}

				continue;
			}

			for (const t of emptyTracksWithNoFillEvidence) {
				if (
					!abstractOccurredTracks.has(t.top) &&
					!abstractOccurredTracks.has(t.down) &&
					occurredTracks + 1 + getAdditionalVerticalFills(t) > expectedTrackCount
				) {
					repeat = true;
					t.isEmpty = false;
					t.isWall = true;
				}
			}
		}
	} while (repeat);

	if (!savePermanently) {
		for (let i = 0; i < oldTracksData.length; ++i) {
			for (let j = 0; j < oldTracksData[i].length; ++j) {
				storedTracks[i][j].isEmpty = oldTracksData[i][j].isEmpty && !storedTracks[i][j].isWall;
				storedTracks[i][j].isTrack = oldTracksData[i][j].isTrack;
				storedTracks[i][j].value = oldTracksData[i][j].value;
				storedTracks[i][j].xCount.value = oldTracksData[i][j].xCountValue;
				storedTracks[i][j].yCount.value = oldTracksData[i][j].yCountValue;
			}
		}
	}

	return addedTracks;
}

function print() {
	console.log('-----------------------------------------------------------');
	console.log(storedTracks[0].map(t => t.xCount.value.toString().padStart(2)));

	for (const r of storedTracks) {
		const p = r.map(x => x.isWall && !x.isTrack ? ' x' : (x.isTrack ? x.value : '  '));
		p.push(r[0].yCount.value.toString());
		console.log(p);
	}

	console.log('-----------------------------------------------------------');
}

self.onmessage = message => {
	setTimeout(() => {
		let { tracks, currentEntry, endEntry, tracksToAdd, tracksToConnect } = message.data;

		console.log(tracks, currentEntry, endEntry, tracksToAdd, tracksToConnect);

		storedTracks = tracks;
		recursiveCalls = 0;

		const now = performance.now();

		try {
			print();
			const additionalTracks = putWalls(true);
			tracksToAdd -= additionalTracks;
			tracksToConnect += additionalTracks;
			print();
			solveRecursively(currentEntry, endEntry, tracksToAdd, tracksToConnect);
			self.postMessage({ message: 'No solution found' })
		} catch (message) {
			console.log(recursiveCalls, performance.now() - now);
			self.postMessage({ tracks, message })
		}
	});
}