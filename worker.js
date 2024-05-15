function solveRecursively(currentEntry, endEntry, tracksToAdd, tracksToConnect, from = null) {
	const minDistance = Math.abs(currentEntry.x - endEntry.x) + Math.abs(currentEntry.y - endEntry.y);

	if (minDistance >= tracksToAdd + tracksToConnect) {
		return;
	}

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
				(neighbour.isEmpty || !neighbour.isWall && ['tl', 'lr', 'dl'].includes(neighbour.value))
			) {
				currentEntry.value = { 't': 'dr', 'd': 'tr', 'r': 'lr' }[from];
				solveRecursively(neighbour, endEntry, tracksToAdd, tracksToConnect, 'r');
			}
		}

		if (from !== 'r') {
			const neighbour = currentEntry.left;

			if (
				neighbour !== null &&
				(neighbour.isEmpty || !neighbour.isWall && ['tr', 'lr', 'dr'].includes(neighbour.value))
			) {
				currentEntry.value = { 't': 'dl', 'd': 'tl', 'l': 'lr' }[from];
				solveRecursively(neighbour, endEntry, tracksToAdd, tracksToConnect, 'l');
			}
		}

		if (from !== 't') {
			const neighbour = currentEntry.down;

			if (
				neighbour !== null &&
				(neighbour.isEmpty || !neighbour.isWall && ['td', 'tr', 'tl'].includes(neighbour.value))
			) {
				currentEntry.value = { 'r': 'dl', 'd': 'td', 'l': 'dr' }[from];
				solveRecursively(neighbour, endEntry, tracksToAdd, tracksToConnect, 'd');
			}
		}

		if (from !== 'd') {
			const neighbour = currentEntry.top;

			if (
				neighbour !== null &&
				(neighbour.isEmpty || !neighbour.isWall && ['td', 'dr', 'dl'].includes(neighbour.value))
			) {
				currentEntry.value = { 'r': 'tl', 't': 'td', 'l': 'tr' }[from];
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
}

function putWalls(tracks) {
	const cornerTrack = tracks[0][0];
	let repeat;

	const height = tracks.length;
	const width = tracks[0].length;

	function isSurrounded(t) {
		let surrounded = 0;

		if (!t.top || t.top.isWall || t.top.value && !t.top.value.includes('d')) {
			++surrounded;
		}

		if (!t.down || t.down.isWall || t.down.value && !t.down.value.includes('t')) {
			++surrounded;
		}

		if (!t.left || t.left.isWall || t.left.value && !t.left.value.includes('r')) {
			++surrounded;
		}

		if (!t.right || t.right.isWall || t.right.value && !t.right.value.includes('l')) {
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

		if (!t.top || t.top.isWall || t.top.value && !t.top.value.includes('d')) {
			topBlocked = true;
		} else if (t.top && !t.top.isWall && t.top.value && t.top.value.includes('d')) {
			topNeightbour = true;
		}

		if (!t.down || t.down.isWall || t.down.value && !t.down.value.includes('t')) {
			downBlocked = true;
		} else if (t.down && !t.down.isWall && t.down.value && t.down.value.includes('t')) {
			downNeightbour = true;
		}

		if (!t.left || t.left.isWall || t.left.value && !t.left.value.includes('r')) {
			leftBlocked = true;
		} else if (t.left && !t.left.isWall && t.left.value && t.left.value.includes('r')) {
			leftNeightbour = true;
		}

		if (!t.right || t.right.isWall || t.right.value && !t.right.value.includes('l')) {
			rightBlocked = true;
		} else if (t.right && !t.right.isWall && t.right.value && t.right.value.includes('l')) {
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
				if (!track.isEmpty || track.value) {
					if (track.isTrack) {
						++expectedTrackCount;
					}

					if (track.isWall && !track.isTrack) {
						++walls;
					} else {
						++occuredTracks;
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
				if (!track.isEmpty || track.value) {
					if (track.isTrack) {
						++expectedTrackCount;
					}

					if (track.isWall && !track.isTrack) {
						++walls;
					} else {
						++occuredTracks;
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

	console.log('-----------------------------------------------------------');
	for (const r of tracks) {
		console.log(r.map(x => x.isWall && !x.value ? ' x' : (x.isEmpty && x.value ? x.value : '  ')));
	}
}

self.onmessage = message => {
	setTimeout(() => {
		const { tracks, currentEntry, endEntry, tracksToAdd, tracksToConnect } = message.data;

		console.log(tracks, currentEntry, endEntry, tracksToAdd, tracksToConnect);

		try {
			putWalls(tracks);

			solveRecursively(currentEntry, endEntry, tracksToAdd, tracksToConnect);
			self.postMessage({ message: 'No solution found' })
		} catch (message) {
			self.postMessage({ tracks, message })
		}
	});
}