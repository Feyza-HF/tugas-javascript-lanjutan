(function() {
	// Item class
	class Item {
		constructor(nama, tipe, nilaiMin, nilaiMax, rarity = 'common') {
			this.nama = nama;
			this.tipe = tipe;
			this.nilaiMin = nilaiMin;
			this.nilaiMax = nilaiMax;
			this.rarity = rarity;
		}
		
		getNilai() {
			return Math.floor(Math.random() * (this.nilaiMax - this.nilaiMin + 1)) + this.nilaiMin;
		}
	}

	// Pemain class
	class Pemain {
		constructor(nama, energi) {
			this.nama = nama;
			this.energi = energi;
			this.energiAwal = energi;
			this.inventori = [];
		}
		makan(porsi) {
			const healAmount = porsi;
			this.energi = Math.min(this.energi + healAmount, this.energiAwal);
			return healAmount;
		}
		damage(attack) {
			this.energi -= attack;
			return attack;
		}
		tambahItem(item) {
			if (this.inventori.length < 10) {
				this.inventori.push(item);
				return true;
			}
			return false;
		}
	}

	// Generate random item
	function generateRandomWeapon() {
		const roll = Math.random();
		if (roll < 0.15) {
			// 15% chance Diamond Sword
			return new Item('💎 Diamond Blade', 'pedang', 25, 40, 'legendary');
		} else if (roll < 0.50) {
			// 35% chance Stone Sword
			return new Item('🪨 Stone Sword', 'pedang', 15, 20, 'uncommon');
		} else {
			// 50% chance Wooden Sword
			return new Item('🪵 Wooden Sword', 'pedang', 5, 10, 'common');
		}
	}

	function generateRandomPotion() {
		const roll = Math.random();
		if (roll < 0.25) {
			// 25% Big Potion
			return new Item('🧪 Big Potion', 'healing', 25, 35, 'rare');
		} else if (roll < 0.60) {
			// 35% Medium Potion
			return new Item('🧪 Medium Potion', 'healing', 15, 20, 'uncommon');
		} else {
			// 40% Low Potion
			return new Item('🧪 Low Potion', 'healing', 5, 8, 'common');
		}
	}

	// Inisialisasi pemain
	let pemain1 = new Pemain('Andi', 100);
	let pemain2 = new Pemain('Donny', 100);
	
	// Item awal: Wooden Sword dan Low Potion
	pemain1.tambahItem(new Item('🪵 Wooden Sword', 'pedang', 5, 10, 'common'));
	pemain1.tambahItem(new Item('🧪 Low Potion', 'healing', 5, 8, 'common'));
	pemain2.tambahItem(new Item('🪵 Wooden Sword', 'pedang', 5, 10, 'common'));
	pemain2.tambahItem(new Item('🧪 Low Potion', 'healing', 5, 8, 'common'));

	let currentPlayer = 1;
	let gameActive = true;
	let turnCount = 0;
	const MAX_TURNS = 20;

	function addLog(message, type = '') {
		const log = document.getElementById('game-log');
		const entry = document.createElement('div');
		entry.className = `log-entry ${type}`;
		entry.textContent = message;
		log.appendChild(entry);
		log.scrollTop = log.scrollHeight;
	}

	function updateUI() {
		// Turn counter
		document.getElementById('turn-display').textContent = `Turn: ${turnCount} / ${MAX_TURNS}`;
		
		// Nama & energi
		document.getElementById('player1-name').textContent = pemain1.nama;
		document.getElementById('player1-energy').textContent = pemain1.energi;
		document.getElementById('player2-name').textContent = pemain2.nama;
		document.getElementById('player2-energy').textContent = pemain2.energi;
		
		// Inventory count
		document.getElementById('inv1-count').textContent = pemain1.inventori.length;
		document.getElementById('inv2-count').textContent = pemain2.inventori.length;
		
		// Bar energi
		const p1Percent = Math.max(0, (pemain1.energi/pemain1.energiAwal)*100);
		const p2Percent = Math.max(0, (pemain2.energi/pemain2.energiAwal)*100);
		document.getElementById('player1-bar').style.width = p1Percent + '%';
		document.getElementById('player1-bar').textContent = Math.round(p1Percent) + '%';
		document.getElementById('player2-bar').style.width = p2Percent + '%';
		document.getElementById('player2-bar').textContent = Math.round(p2Percent) + '%';
		
        // Inventori
        renderInventori();

        // Highlight giliran
        document.getElementById('player1-card').classList.toggle('active', currentPlayer === 1);
        document.getElementById('player2-card').classList.toggle('active', currentPlayer === 2);

        // Info giliran
        document.getElementById('current-player').textContent = `⚔️ Giliran: ${currentPlayer === 1 ? pemain1.nama : pemain2.nama}`;

        // Otomatis skip turn jika pemain tidak punya item,
        // dan hanya double turn jika lawan juga tidak punya item
        if (gameActive) {
            let user = currentPlayer === 1 ? pemain1 : pemain2;
            let lawan = currentPlayer === 1 ? pemain2 : pemain1;
            if (user.inventori.length === 0) {
                if (lawan.inventori.length === 0) {
                    // Lawan juga kosong, lanjutkan turn ke user lagi (double turn)
                    addLog(`⏭️ ${user.nama} has no items! Turn skipped.`, 'item-gain');
                    turnCount++;
                    if (turnCount >= MAX_TURNS) {
                        endGameByTurn();
                        return;
                    }
                    if (turnCount % 2 === 0) giveRandomItems();
                    // currentPlayer tetap sama
                    updateUI();
                    renderHistory();
                } else {
                    // Lawan masih punya item, lanjut ke lawan
                    addLog(`⏭️ ${user.nama} has no items! Turn skipped.`, 'item-gain');
                    turnCount++;
                    if (turnCount >= MAX_TURNS) {
                        endGameByTurn();
                        return;
                    }
                    if (turnCount % 2 === 0) giveRandomItems();
                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                    updateUI();
                    renderHistory();
                }
            }
        }
	}

	function renderInventori() {
		const inv1 = document.getElementById('inventori1');
		const inv2 = document.getElementById('inventori2');
		inv1.innerHTML = '';
		inv2.innerHTML = '';
		
		pemain1.inventori.forEach((item, idx) => {
			const btn = document.createElement('button');
			btn.textContent = item.nama;
			btn.onclick = () => pakaiItem(1, idx);
			btn.className = item.tipe === 'pedang' ? 'attack-btn' : 'heal-btn';
			if (item.rarity === 'legendary') btn.classList.add('legendary');
			btn.disabled = currentPlayer !== 1 || !gameActive;
			inv1.appendChild(btn);
		});
		
		pemain2.inventori.forEach((item, idx) => {
			const btn = document.createElement('button');
			btn.textContent = item.nama;
			btn.onclick = () => pakaiItem(2, idx);
			btn.className = item.tipe === 'pedang' ? 'attack-btn' : 'heal-btn';
			if (item.rarity === 'legendary') btn.classList.add('legendary');
			btn.disabled = currentPlayer !== 2 || !gameActive;
			inv2.appendChild(btn);
		});
	}

    function giveRandomItems() {
        /*
        Chance breakdown (total 100%):
        - 10%: Semua pemain tidak dapat item
        - 10%: Salah satu pemain tidak dapat item (acak siapa)
        - 20%: Salah satu pemain dapat double item (acak siapa)
        - 10%: Kedua pemain dapat double item
        - 25%: Salah satu pemain dapat 1 item (acak siapa)
        - 25%: Kedua pemain dapat 1 item
        */
        const roll = Math.random();
        if (roll < 0.10) {
            // 10%: Semua pemain tidak dapat item
            addLog('🌑 MIST DESCENDS... No one receives an item this round!', 'item-gain');
            return;
        } else if (roll < 0.20) {
            // 10%: Salah satu pemain tidak dapat item (acak siapa)
            const whoNoItem = Math.random() < 0.5 ? 1 : 2;
            const whoGet = whoNoItem === 1 ? pemain2 : pemain1;
            if (whoGet.inventori.length >= 10) {
                addLog(`⚠️ ${whoGet.nama}'s inventory is full!`, 'item-gain');
                return;
            }
            const itemType = Math.random() < 0.6 ? 'weapon' : 'potion';
            let newItem = itemType === 'weapon' ? generateRandomWeapon() : generateRandomPotion();
            if (whoGet.tambahItem(newItem)) {
                let rarityText = '';
                if (newItem.rarity === 'legendary') rarityText = ' ✨LEGENDARY✨';
                else if (newItem.rarity === 'rare') rarityText = ' ⭐RARE';
                else if (newItem.rarity === 'uncommon') rarityText = ' 🔸UNCOMMON';
                addLog(`🎁 ${whoGet.nama} received ${newItem.nama}${rarityText}!`, 'item-gain');
            }
            addLog(`🌑 ${whoNoItem === 1 ? pemain1.nama : pemain2.nama} receives nothing this round.`, 'item-gain');
            return;
        } else if (roll < 0.40) {
            // 20%: Salah satu pemain yang inventori-nya kosong dapat double item
            let kosong = [];
            if (pemain1.inventori.length === 0) kosong.push(pemain1);
            if (pemain2.inventori.length === 0) kosong.push(pemain2);
            if (kosong.length > 0) {
                // Pilih salah satu yang kosong
                const player = kosong[Math.floor(Math.random() * kosong.length)];
                let count = 0;
                for (let i = 0; i < 2; i++) {
                    if (player.inventori.length < 10) {
                        const itemType = Math.random() < 0.6 ? 'weapon' : 'potion';
                        let newItem = itemType === 'weapon' ? generateRandomWeapon() : generateRandomPotion();
                        if (player.tambahItem(newItem)) {
                            let rarityText = '';
                            if (newItem.rarity === 'legendary') rarityText = ' ✨LEGENDARY✨';
                            else if (newItem.rarity === 'rare') rarityText = ' ⭐RARE';
                            else if (newItem.rarity === 'uncommon') rarityText = ' 🔸UNCOMMON';
                            addLog(`🎁 ${player.nama} received ${newItem.nama}${rarityText}!`, 'item-gain');
                            count++;
                        }
                    }
                }
                if (count === 0) {
                    addLog(`⚠️ ${player.nama}'s inventory is full!`, 'item-gain');
                }
            } else {
                // Tidak ada yang kosong, fallback ke single item salah satu
                const who = Math.random() < 0.5 ? pemain1 : pemain2;
                if (who.inventori.length >= 10) {
                    addLog(`⚠️ ${who.nama}'s inventory is full!`, 'item-gain');
                    return;
                }
                const itemType = Math.random() < 0.6 ? 'weapon' : 'potion';
                let newItem = itemType === 'weapon' ? generateRandomWeapon() : generateRandomPotion();
                if (who.tambahItem(newItem)) {
                    let rarityText = '';
                    if (newItem.rarity === 'legendary') rarityText = ' ✨LEGENDARY✨';
                    else if (newItem.rarity === 'rare') rarityText = ' ⭐RARE';
                    else if (newItem.rarity === 'uncommon') rarityText = ' 🔸UNCOMMON';
                    addLog(`🎁 ${who.nama} received ${newItem.nama}${rarityText}!`, 'item-gain');
                }
            }
            return;
        } else if (roll < 0.50) {
            // 10%: Kedua pemain dapat double item hanya jika inventori mereka kosong
            if (pemain1.inventori.length === 0 && pemain2.inventori.length === 0) {
                [pemain1, pemain2].forEach(player => {
                    let count = 0;
                    for (let i = 0; i < 2; i++) {
                        if (player.inventori.length < 10) {
                            const itemType = Math.random() < 0.6 ? 'weapon' : 'potion';
                            let newItem = itemType === 'weapon' ? generateRandomWeapon() : generateRandomPotion();
                            if (player.tambahItem(newItem)) {
                                let rarityText = '';
                                if (newItem.rarity === 'legendary') rarityText = ' ✨LEGENDARY✨';
                                else if (newItem.rarity === 'rare') rarityText = ' ⭐RARE';
                                else if (newItem.rarity === 'uncommon') rarityText = ' 🔸UNCOMMON';
                                addLog(`🎁 ${player.nama} received ${newItem.nama}${rarityText}!`, 'item-gain');
                                count++;
                            }
                        }
                    }
                    if (count === 0) {
                        addLog(`⚠️ ${player.nama}'s inventory is full!`, 'item-gain');
                    }
                });
            } else {
                // Fallback ke single item salah satu
                const who = Math.random() < 0.5 ? pemain1 : pemain2;
                if (who.inventori.length >= 10) {
                    addLog(`⚠️ ${who.nama}'s inventory is full!`, 'item-gain');
                    return;
                }
                const itemType = Math.random() < 0.6 ? 'weapon' : 'potion';
                let newItem = itemType === 'weapon' ? generateRandomWeapon() : generateRandomPotion();
                if (who.tambahItem(newItem)) {
                    let rarityText = '';
                    if (newItem.rarity === 'legendary') rarityText = ' ✨LEGENDARY✨';
                    else if (newItem.rarity === 'rare') rarityText = ' ⭐RARE';
                    else if (newItem.rarity === 'uncommon') rarityText = ' 🔸UNCOMMON';
                    addLog(`🎁 ${who.nama} received ${newItem.nama}${rarityText}!`, 'item-gain');
                }
            }
            return;
        } else if (roll < 0.75) {
            // 25%: Salah satu pemain dapat 1 item (acak siapa)
            const who = Math.random() < 0.5 ? 1 : 2;
            const player = who === 1 ? pemain1 : pemain2;
            if (player.inventori.length >= 10) {
                addLog(`⚠️ ${player.nama}'s inventory is full!`, 'item-gain');
                return;
            }
            const itemType = Math.random() < 0.6 ? 'weapon' : 'potion';
            let newItem = itemType === 'weapon' ? generateRandomWeapon() : generateRandomPotion();
            if (player.tambahItem(newItem)) {
                let rarityText = '';
                if (newItem.rarity === 'legendary') rarityText = ' ✨LEGENDARY✨';
                else if (newItem.rarity === 'rare') rarityText = ' ⭐RARE';
                else if (newItem.rarity === 'uncommon') rarityText = ' 🔸UNCOMMON';
                addLog(`🎁 ${player.nama} received ${newItem.nama}${rarityText}!`, 'item-gain');
            }
            return;
        } else {
            // 25%: Kedua pemain dapat 1 item
            [pemain1, pemain2].forEach(player => {
                if (player.inventori.length >= 10) {
                    addLog(`⚠️ ${player.nama}'s inventory is full!`, 'item-gain');
                    return;
                }
                const itemType = Math.random() < 0.6 ? 'weapon' : 'potion';
                let newItem = itemType === 'weapon' ? generateRandomWeapon() : generateRandomPotion();
                if (player.tambahItem(newItem)) {
                    let rarityText = '';
                    if (newItem.rarity === 'legendary') rarityText = ' ✨LEGENDARY✨';
                    else if (newItem.rarity === 'rare') rarityText = ' ⭐RARE';
                    else if (newItem.rarity === 'uncommon') rarityText = ' 🔸UNCOMMON';
                    addLog(`🎁 ${player.nama} received ${newItem.nama}${rarityText}!`, 'item-gain');
                }
            });
        }
    }

    // History chat
    let history = [];

    function renderHistory() {
        let chat = document.getElementById('history-chat');
        if (!chat) {
            chat = document.createElement('div');
            chat.id = 'history-chat';
            chat.style.background = 'rgba(20,20,30,0.85)';
            chat.style.borderRadius = '12px';
            chat.style.margin = '18px auto 0 auto';
            chat.style.maxWidth = '700px';
            chat.style.padding = '12px';
            chat.style.minHeight = '60px';
            chat.style.fontFamily = 'monospace';
            chat.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
            chat.style.display = 'flex';
            chat.style.flexDirection = 'column';
            chat.style.overflowY = 'auto';
            chat.style.maxHeight = '220px';
            document.querySelector('.game-container').appendChild(chat);
        }
        chat.innerHTML = '';
        history.slice(-12).forEach(h => {
            const bubble = document.createElement('div');
            bubble.textContent = h.text;
            bubble.style.margin = '6px 0';
            bubble.style.padding = '8px 14px';
            bubble.style.borderRadius = '16px';
            bubble.style.maxWidth = '70%';
            bubble.style.display = 'inline-block';
            bubble.style.background = h.type === 'attack' ? 'linear-gradient(90deg,#8b0000,#dc143c)' : 'linear-gradient(90deg,#27ae60,#2ecc71)';
            bubble.style.color = 'white';
            bubble.style.alignSelf = h.player === 1 ? 'flex-start' : 'flex-end';
            bubble.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            bubble.style.fontWeight = 'bold';
            chat.appendChild(bubble);
        });
        // Scroll ke bawah otomatis
        chat.scrollTop = chat.scrollHeight;
    }

    function pakaiItem(playerNum, idx) {
        if (!gameActive) return;
        let user = playerNum === 1 ? pemain1 : pemain2;
        let target = playerNum === 1 ? pemain2 : pemain1;
        if (!user.inventori.length) {
            addLog(`⏭️ ${user.nama} has no items! Turn skipped.`, 'item-gain');
            // Increment turn
            turnCount++;
            if (turnCount >= MAX_TURNS) {
                endGameByTurn();
                return;
            }
            if (turnCount % 2 === 0) giveRandomItems();
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateUI();
            renderHistory();
            return;
        }
        const item = user.inventori[idx];
        const nilai = item.getNilai();
        let msg = '';
        if (item.tipe === 'pedang') {
            target.damage(nilai);
            msg = `⚔️ ${user.nama} uses ${item.nama}, dealing ${nilai} damage to ${target.nama}!`;
            addLog(msg, 'attack');
            history.push({text: `${user.nama} ➡️ ${target.nama}: -${nilai} HP (${item.nama})`, type:'attack', player:playerNum});
        } else if (item.tipe === 'healing') {
            user.makan(nilai);
            msg = `💚 ${user.nama} uses ${item.nama}, healing ${nilai} HP!`;
            addLog(msg, 'heal');
            history.push({text: `${user.nama} 💚 +${nilai} HP (${item.nama})`, type:'heal', player:playerNum});
        }
        user.inventori.splice(idx, 1);
        updateUI();
        renderHistory();
        checkGameOver();
        if (gameActive) {
            turnCount++;
            if (turnCount >= MAX_TURNS) {
                endGameByTurn();
                return;
            }
            if (turnCount % 2 === 0) giveRandomItems();
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateUI();
            renderHistory();
        }
    }

	function checkGameOver() {
		if (pemain1.energi <= 0) {
			endGame(pemain2.nama);
		} else if (pemain2.energi <= 0) {
			endGame(pemain1.nama);
		}
	}

	function endGame(winner) {
		gameActive = false;
		addLog(`💀 ${winner} WINS THE DARK FANTASY ARENA! 💀`, 'game-over');
		document.getElementById('winner-display').innerHTML = `<div class="winner">🏆 ${winner} VICTORIOUS! 🏆</div>`;
		renderInventori();
	}

	function endGameByTurn() {
		gameActive = false;
		let winner;
		if (pemain1.energi > pemain2.energi) {
			winner = pemain1.nama;
		} else if (pemain2.energi > pemain1.energi) {
			winner = pemain2.nama;
		} else {
			addLog(`⚔️ DRAW! Both warriors survived with equal HP!`, 'game-over');
			document.getElementById('winner-display').innerHTML = `<div class="winner">⚔️ EPIC DRAW! ⚔️</div>`;
			renderInventori();
			return;
		}
		addLog(`⏰ Max turns reached! ${winner} wins with more HP!`, 'game-over');
		document.getElementById('winner-display').innerHTML = `<div class="winner">🏆 ${winner} WINS! 🏆</div>`;
		renderInventori();
	}

    // Init
    if (typeof document !== 'undefined') {
        updateUI();
        addLog('🌙 The Dark Fantasy Arena awaits! Choose your weapons wisely...');
        renderHistory();
    }

})();