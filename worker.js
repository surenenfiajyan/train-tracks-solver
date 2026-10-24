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

function solveRecursively(currentEntry, endEntry, tracksToAdd, tracksToConnect, from = null) {
	const minDistance = Math.abs(currentEntry.x - endEntry.x) + Math.abs(currentEntry.y - endEntry.y);

	if (minDistance >= tracksToAdd + tracksToConnect) {
		return;
	}

	///*
	++depth;
	++recursiveCalls;
	const shouldPutWalls = true && depth < 15;

	if (shouldPutWalls) {
		//console.log('before')
		//print();
		putWalls();
		//console.log('after')
		//print();
	}
	//*/

	if (tracksToAdd > 0 && currentEntry.isEmpty && currentEntry.xCount.value > 0 && currentEntry.yCount.value > 0) {
		currentEntry.isEmpty = false;
		currentEntry.isTrack = true;
		currentEntry.isWall = true;
		--currentEntry.xCount.value;
		--currentEntry.yCount.value;
		--tracksToAdd;

		if (from !== 'l') {
			const neighbour = currentEntry.right;

			if (
				neighbour !== null &&
				(neighbour.isEmpty || !neighbour.isWall && neighboursOfL.includes(neighbour.value))
			) {
				currentEntry.value = fromL[from];
				solveRecursively(neighbour, endEntry, tracksToAdd, tracksToConnect, 'r');
			}
		}

		if (from !== 'r') {
			const neighbour = currentEntry.left;

			if (
				neighbour !== null &&
				(neighbour.isEmpty || !neighbour.isWall && neighboursOfR.includes(neighbour.value))
			) {
				currentEntry.value = fromR[from];
				solveRecursively(neighbour, endEntry, tracksToAdd, tracksToConnect, 'l');
			}
		}

		if (from !== 't') {
			const neighbour = currentEntry.down;

			if (
				neighbour !== null &&
				(neighbour.isEmpty || !neighbour.isWall && neighboursOfT.includes(neighbour.value))
			) {
				currentEntry.value = fromT[from];
				solveRecursively(neighbour, endEntry, tracksToAdd, tracksToConnect, 'd');
			}
		}

		if (from !== 'd') {
			const neighbour = currentEntry.top;

			if (
				neighbour !== null &&
				(neighbour.isEmpty || !neighbour.isWall && neighboursOfD.includes(neighbour.value))
			) {
				currentEntry.value = fromD[from];
				solveRecursively(neighbour, endEntry, tracksToAdd, tracksToConnect, 't');
			}
		}

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

function putWalls() {
	const oldTracksData = storedTracks.map(r => r.map(t => ({
		isWall: t.isWall,
		isTrack: t.isTrack,
		isEmpty: t.isEmpty,
		value: t.value,
		xCountValue: t.xCount.value,
		yCountValue: t.yCount.value,

	})));
	oldVersionsOfTracksData.push(oldTracksData);

	const cornerTrack = storedTracks[0][0];
	let repeat;

	const height = storedTracks.length;
	const width = storedTracks[0].length;

	function isTopBlocked(t) {
		return !t.top || t.top.isWall && !t.top.isTrack || t.top.isTrack && !t.top.value.includes('d');
	}

	function isDownBlocked(t) {
		return !t.down || t.down.isWall && !t.down.isTrack && t.down.isTrack && !t.down.value.includes('t');
	}

	function isLeftBlocked(t) {
		return !t.left || t.left.isWall && !t.left.isTrack && t.left.isTrack && !t.left.value.includes('r');
	}

	function isRightBlocked(t) {
		return !t.right || t.right.isWall && !t.right.isTrack && t.right.isTrack && !t.right.value.includes('l');
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

	function getFillStatus(t) {
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

		return topNeightbour || downNeightbour || leftNeightbour || rightNeightbour;
	}

	do {
		repeat = false;

		for (let rowStart = cornerTrack; rowStart; rowStart = rowStart.down) {
			const emptyTracksWithNoFillEvidence = [];
			let expectedTrackCount = rowStart.yCount.value, walls = 0, occuredTracks = 0;

			for (let track = rowStart; track; track = track.right) {
				/////////////////////////////////
				if (!track.isEmpty) {
					if (track.isTrack) {
						++expectedTrackCount;
						++occuredTracks;
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

				const fillStatus = getFillStatus(track);

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
					++occuredTracks;
				} else {
					++occuredTracks;
				}
			}

			if (emptyTracksWithNoFillEvidence.length === width - expectedTrackCount - walls || expectedTrackCount === occuredTracks) {
				for (const t of emptyTracksWithNoFillEvidence) {
					repeat = true;
					t.isEmpty = false;
					t.isWall = true;
				}
			}
		}

		for (let colStart = cornerTrack; colStart; colStart = colStart.right) {
			const emptyTracksWithNoFillEvidence = [];
			let expectedTrackCount = colStart.xCount.value, walls = 0, occuredTracks = 0;

			for (let track = colStart; track; track = track.down) {
				/////////////////////////////////
				if (!track.isEmpty) {
					if (track.isTrack) {
						++expectedTrackCount;
						++occuredTracks;
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

				const fillStatus = getFillStatus(track);

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
					++occuredTracks;
				} else {
					++occuredTracks;
				}
			}

			if (emptyTracksWithNoFillEvidence.length === height - expectedTrackCount - walls || expectedTrackCount === occuredTracks) {
				for (const t of emptyTracksWithNoFillEvidence) {
					repeat = true;
					t.isEmpty = false;
					t.isWall = true;
				}
			}
		}
	} while (repeat);

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

function print() {
	console.log('-----------------------------------------------------------');

	console.log(storedTracks.map(r => r[0].xCount.value.toString().padStart(2)));

	for (const r of storedTracks) {
		const p = r.map(x => x.isWall && !x.isTrack ? ' x' : (x.isTrack ? x.value : '  '));
		p.push(r[0].yCount.value.toString());
		console.log(p);
	}

	console.log('-----------------------------------------------------------');
}

self.onmessage = message => {
	setTimeout(() => {
		const { tracks, currentEntry, endEntry, tracksToAdd, tracksToConnect } = message.data;

		console.log(tracks, currentEntry, endEntry, tracksToAdd, tracksToConnect);

		storedTracks = tracks;
		recursiveCalls = 0;

		try {
			print();
			putWalls();
			print();
			solveRecursively(currentEntry, endEntry, tracksToAdd, tracksToConnect);
			self.postMessage({ message: 'No solution found' })
		} catch (message) {
			console.log(recursiveCalls);
			self.postMessage({ tracks, message })
		}
	});
}