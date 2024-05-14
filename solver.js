const horizontalCnt = document.querySelector('.horizontal');
const verticalCnt = document.querySelector('.vertical');
const itemsCnt = document.querySelector('.items');
const widthEl = document.getElementById('width');
const heightEl = document.getElementById('height');
const styleEl = document.getElementById('inlineStyle');
const selectCnt = document.getElementById('selectBtns');
const clearButton = document.getElementById('clearBtn');
const solveButton = document.getElementById('solveBtn');
const saveButton = document.getElementById('saveBtn');
const loadButton = document.getElementById('loadBtn');
const linkEl = document.createElement('a');
const fileEl = document.createElement('input');

fileEl.type = 'file';
fileEl.accept = '.json';
fileEl.tabIndex = linkEl.tabIndex = -1;
linkEl.style = fileEl.style = 'position: fixed; top: -100px; left: -100px;';
document.body.append(fileEl, linkEl);

let worker = null;

let selectedEl = document.querySelector('[data-value="erase"]');

function terminateWorker() {
	worker?.terminate();
	worker = null;
	solveButton.innerText = 'Solve';
}

selectCnt.onclick = ev => {
	terminateWorker();
	const target = ev.target.closest('button');

	if (target instanceof HTMLButtonElement) {
		selectedEl = target;

		[...selectCnt.children].forEach(element => {
			element.classList.remove('active');
		});

		selectedEl.classList.add('active');
	}
};

selectedEl.click();

widthEl.onchange = heightEl.onchange = ev => {
	terminateWorker();
	const target = ev.target;

	if (target instanceof HTMLInputElement) {
		if (isNaN(target.valueAsNumber)) {
			target.valueAsNumber = +target.min;
		}

		target.valueAsNumber = Math.max(target.valueAsNumber, +target.min);
		target.valueAsNumber = Math.min(target.valueAsNumber, +target.max);
		target.valueAsNumber = Math.round(target.valueAsNumber);

		resize();
	}
};

horizontalCnt.onchange = verticalCnt.onchange = ev => {
	terminateWorker();
	const target = ev.target;

	if (target instanceof HTMLInputElement) {
		if (isNaN(target.valueAsNumber)) {
			target.valueAsNumber = 0;
		}

		target.valueAsNumber = Math.abs(Math.round(target.valueAsNumber));
	}
};

itemsCnt.onclick = ev => {
	terminateWorker();
	const target = ev.target.closest('button');

	if (target instanceof HTMLButtonElement) {
		const newTarget = selectedEl.cloneNode(true);
		newTarget.classList.remove('active');

		if (newTarget.dataset.value === 'erase') {
			newTarget.innerHTML = '';
			delete newTarget.dataset.value;
		}

		target.replaceWith(newTarget);
	}
};

function resize() {
	terminateWorker();
	horizontalCnt.innerHTML = `<input class="item" type="number" value="0">`.repeat(widthEl.valueAsNumber);
	verticalCnt.innerHTML = `<input class="item" type="number" value="0">`.repeat(heightEl.valueAsNumber);
	itemsCnt.innerHTML = `<div class="item-row">${`<button class="item"></button>`.repeat(widthEl.valueAsNumber)}</div>`.repeat(heightEl.valueAsNumber);

	styleEl.innerHTML = `:root {
		--item-size: min(${50 / widthEl.valueAsNumber}vw, 50px);
	}`;
}

resize();

clearButton.onclick = resize;
solveButton.onclick = solve;

function solve() {
	terminateWorker();
	const width = widthEl.valueAsNumber;
	const height = heightEl.valueAsNumber;
	const horizontalCounts = [...horizontalCnt.querySelectorAll('input')].map(el => ({ value: el.valueAsNumber }));
	const verticalCounts = [...verticalCnt.querySelectorAll('input')].map(el => ({ value: el.valueAsNumber }));
	const buttonsMap = new Map();
	const tracks = [...itemsCnt.querySelectorAll('.item-row')].map((r, y) => [...r.querySelectorAll('button')].map((b, x) => {
		const value = b.dataset.value ?? null;
		const key = `${x}_${y}`;
		buttonsMap.set(key, b);

		const neighbours = {
			'': {
				n1X: x,
				n1Y: y,
				n2X: x,
				n2Y: y,
			},
			'wall': {
				n1X: x,
				n1Y: y,
				n2X: x,
				n2Y: y,
			},
			'lr': {
				n1X: x - 1,
				n1Y: y,
				n2X: x + 1,
				n2Y: y,
			},
			'td': {
				n1X: x,
				n1Y: y - 1,
				n2X: x,
				n2Y: y + 1,
			},
			'tl': {
				n1X: x,
				n1Y: y - 1,
				n2X: x - 1,
				n2Y: y,
			},
			'tr': {
				n1X: x,
				n1Y: y - 1,
				n2X: x + 1,
				n2Y: y,
			},
			'dl': {
				n1X: x,
				n1Y: y + 1,
				n2X: x - 1,
				n2Y: y,
			},
			'dr': {
				n1X: x,
				n1Y: y + 1,
				n2X: x + 1,
				n2Y: y,
			}
		}[value ?? ''];

		return {
			element: key,
			value,
			isWall: value === 'wall',
			isEmpty: value !== 'wall' && !value,
			isTrack: value !== 'wall' && !!value,
			x,
			y,
			groupCount: 1,
			n1: null,
			n2: null,
			oppositeEnd: null,
			left: null,
			right: null,
			top: null,
			down: null,
			xCount: horizontalCounts[x],
			yCount: verticalCounts[y],
			...neighbours,
		}
	}));

	const tracksCount = tracks.reduce((acc, cur) => acc + cur.reduce((a, c) => a + (c.isTrack ? 1 : 0), 0), 0);
	const wallsCount = tracks.reduce((acc, cur) => acc + cur.reduce((a, c) => a + (c.isWall ? 1 : 0), 0), 0);

	const expectedTracksCount = horizontalCounts.reduce((acc, cur) => cur.value + acc, 0);

	if (expectedTracksCount !== verticalCounts.reduce((acc, cur) => cur.value + acc, 0)) {
		alert('Row and column count sums should match');
		return;
	}

	if (tracksCount > expectedTracksCount) {
		alert(`The track count (${tracksCount}) exceeds the expected track count (${expectedTracksCount})`);
		return;
	}

	for (let i = 0; i < horizontalCounts.length; ++i) {
		if (horizontalCounts[i].value > height) {
			alert(`Unreachable track count at colum ${i + 1}`);
			return;
		}
	}

	for (let i = 0; i < verticalCounts.length; ++i) {
		if (verticalCounts[i].value > width) {
			alert(`Unreachable track count at row ${i + 1}`);
			return;
		}
	}

	if (expectedTracksCount > width * height - wallsCount) {
		alert(`Unreachable total track count (${expectedTracksCount})`);
		return;
	}

	let entryA = null, entryB = null;

	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			if (x > 0) {
				tracks[y][x].left = tracks[y][x - 1];
			}

			if (y > 0) {
				tracks[y][x].top = tracks[y - 1][x];
			}

			if (x < width - 1) {
				tracks[y][x].right = tracks[y][x + 1];
			}

			if (y < height - 1) {
				tracks[y][x].down = tracks[y + 1][x];
			}

			if (tracks[y][x].isTrack) {
				if (--tracks[y][x].xCount.value < 0) {
					alert(`The track count exceeds for column ${x + 1}`);
					return;
				}

				if (--tracks[y][x].yCount.value < 0) {
					alert(`The track count exceeds for row ${y + 1}`);
					return;
				}

				const { n1X, n2X, n1Y, n2Y } = tracks[y][x];

				const n1CrossesField = n1X < 0 || n1X === width || n1Y < 0 || n1Y === height;
				const n2CrossesField = n2X < 0 || n2X === width || n2Y < 0 || n2Y === height;

				if (
					!n1CrossesField && !tracks[n1Y][n1X].isEmpty && (tracks[n1Y][n1X].n1X !== x || tracks[n1Y][n1X].n1Y !== y) && (tracks[n1Y][n1X].n2X !== x || tracks[n1Y][n1X].n2Y !== y) ||
					!n2CrossesField && !tracks[n2Y][n2X].isEmpty && (tracks[n2Y][n2X].n1X !== x || tracks[n2Y][n2X].n1Y !== y) && (tracks[n2Y][n2X].n2X !== x || tracks[n2Y][n2X].n2Y !== y)
				) {
					alert(`The track [${x + 1}, ${y + 1}] doesn't properly connect to it's neighbour(s)`);
					return;
				}

				if (!entryA) {
					if (n1CrossesField && n2CrossesField) {
						entryA = entryB = tracks[y][x];
					} else if (n1CrossesField || n2CrossesField) {
						entryA = tracks[y][x];
					}
				} else if (!entryB) {
					if (n1CrossesField && n2CrossesField) {
						alert(`More than 2 entry / exit points`);
						return;
					} else if (n1CrossesField || n2CrossesField) {
						entryB = tracks[y][x];
					}
				} else if (n1CrossesField || n2CrossesField) {
					alert(`More than 2 entry / exit points`);
					return;
				}

				if (!n1CrossesField && tracks[n1Y][n1X].isTrack) {
					tracks[y][x].n1 = tracks[n1Y][n1X];
				}

				if (!n2CrossesField && tracks[n2Y][n2X].isTrack) {
					tracks[y][x].n2 = tracks[n2Y][n2X];
				}
			}
		}
	}

	if (!entryA || !entryB) {
		alert(`Need 2 entry / exit points`);
		return;
	}

	const visited = new WeakSet();

	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			if (tracks[y][x].isTrack && !visited.has(tracks[y][x])) {
				if (tracks[y][x].n1 === null && tracks[y][x].n2 === null) {
					visited.add(tracks[y][x]);
					tracks[y][x].oppositeEnd = tracks[y][x];
					continue;
				}

				if (tracks[y][x].n1 !== null && tracks[y][x].n2 !== null) {
					continue;
				}

				visited.add(tracks[y][x]);
				const a = tracks[y][x];
				const group = [a];
				let b = a;

				loop:
				do {
					for (const n of [b.n1, b.n2]) {
						if (n !== null && n.isTrack && !visited.has(n)) {
							added = true;
							group.push(n);
							visited.add(n);
							b = n;
							continue loop;
						}
					}

					break;
				} while (true);

				for (const t of group) {
					t.groupCount = group.length;

					if (t !== a && t !== b) {
						t.isWall = true;
					}

					if (t === a) {
						t.oppositeEnd = b;
					} else if (t === b) {
						t.oppositeEnd = a;
					}
				}
			}
		}
	}

	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			if (tracks[y][x].isTrack && !visited.has(tracks[y][x])) {
				alert(`The track [${x + 1}, ${y + 1}] is in a cycle`);
				return;
			}
		}
	}

	if (entryA.oppositeEnd === entryB) {
		if (expectedTracksCount > tracksCount || entryA.groupCount < tracksCount) {
			alert('The the path connecting entry and exit points does not contain all tracks');
		}

		return;
	}

	worker = new Worker('worker.js');
	worker.postMessage({ tracks, currentEntry: entryA, endEntry: entryB, tracksToAdd: expectedTracksCount - tracksCount, tracksToConnect: tracksCount })
	solveButton.innerText = 'Solving';
	worker.onmessage = msg => {
		terminateWorker();
		const { tracks, message } = msg.data;

		if (message === 'solved') {
			for (let y = 0; y < height; ++y) {
				for (let x = 0; x < width; ++x) {
					if (tracks[y][x].isTrack) {
						const newEl = selectCnt.querySelector(`[data-value="${tracks[y][x].value}"]`).cloneNode(true);
						newEl.classList.remove('active');
						buttonsMap.get(tracks[y][x].element).replaceWith(newEl);
					}
				}
			}
		} else {
			alert(message);
		}
	};
}

function save() {
	const obj = {
		width: widthEl.valueAsNumber,
		height: heightEl.valueAsNumber,
		tracks: [...itemsCnt.querySelectorAll('.item-row')].map(row => [...row.querySelectorAll('button')].map(cell => cell.dataset.value ?? null)),
		horizontalCounts: [...horizontalCnt.querySelectorAll('input')].map(el => el.valueAsNumber),
		verticalCounts: [...verticalCnt.querySelectorAll('input')].map(el => el.valueAsNumber),
	};

	if (linkEl.href) {
		URL.revokeObjectURL(linkEl.href);
	}

	file = new Blob([JSON.stringify(obj)], { type: 'application/json' });
	linkEl.href = URL.createObjectURL(file);
	linkEl.download = `Saved ${obj.width} x ${obj.height} ${new Date().toLocaleString()}.json`;
	linkEl.click();
}

function load() {
	fileEl.value = '';
	fileEl.onchange = async () => {
		if (fileEl.files?.length) {
			const fileUrl = URL.createObjectURL(fileEl.files[0]);

			try {
				const response = await fetch(fileUrl);
				const { width, height, tracks, horizontalCounts, verticalCounts } = await response.json();

				if (typeof width !== 'number' || typeof height !== 'number' || !Number.isInteger(width) || !Number.isInteger(height)) {
					throw 'Invalid width or height';
				}

				if (width < +widthEl.min || width > +widthEl.max || height < +heightEl.min || height > +heightEl.max) {
					throw 'Bound errors';
				}

				widthEl.valueAsNumber = width;
				heightEl.valueAsNumber = height;
				resize();

				itemsCnt.querySelectorAll('.item-row').forEach((row, y) => {
					row.querySelectorAll('button').forEach((button, x) => {
						if (['td', 'tr', 'tl', 'lr', 'dl', 'dr', 'wall'].includes(tracks[y][x])) {
							const copy = selectCnt.querySelector(`[data-value="${tracks[y][x]}"]`).cloneNode(true);
							copy.classList.remove('active');
							button.replaceWith(copy);
						}
					});
				});

				horizontalCnt.querySelectorAll('input').forEach((el, i) => {
					if (horizontalCounts && Number.isInteger(horizontalCounts[i]) && horizontalCounts[i] > 0) {
						el.valueAsNumber = horizontalCounts[i];
					}
				});

				verticalCnt.querySelectorAll('input').forEach((el, i) => {
					if (verticalCounts && Number.isInteger(verticalCounts[i]) && verticalCounts[i] > 0) {
						el.valueAsNumber = verticalCounts[i];
					}
				});

			} catch (e) {
				alert('Invalid file');
				console.error(e);
			} finally {
				URL.revokeObjectURL(fileUrl);
			}
		}
	}

	fileEl.click();
}


loadButton.onclick = load;
saveButton.onclick = save;