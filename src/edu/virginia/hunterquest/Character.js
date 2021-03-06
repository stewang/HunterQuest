// Lawrence Hook

"use strict";

class Character extends Entity {

	constructor(id, filename, jsonSprites, parentObj=null) {

		super(id, filename, jsonSprites, parentObj);
		Character.instance = this;

		// Set proper character image
		this.loadImage(filename);

		this.xMinBound = 0;
		this.xMaxBound;
		this.yMinBound = 0;
		this.yMaxBound;

		this.speed = 6;

		this.hp = 30;
		this.deaths = 0;

		this.flinchable = true;
		this.weapon = 1;
		this.attackType = "attack1";
		this.weaponChangeCooldown = false;

		this.projectileSpeed 	= 15;

		this.burstCount;
		this.recentlyShot = false;
		this.attackCooldown = 0;

		/*
		 * Store upgrades
		 */
		this.level 				= 1;
		this.maxHealth 			= 30;
		this.projectileSize 	= 12;
		this.projectileDamage 	= 0.5;
		this.projectileColor	= "#2f4d2f";
		this.projectileFilename = "weapon/energyball.png";
		this.projectileFilename2 = "weapon/neonball.png";

		this.singleShot = true;
		this.burstShot = false;
		this.machineShot = false;
		this.burst = 3;
		this.maxAttackCooldown 	= 30;

		this.poisonDamage = 0;
		this.poisonDuration = 300;

		this.lifeSteal = 0;

		this.skillPoints = 1;
		this.spSpent = [0,0,0,0,0];
	}

	static getInstance() {
		return Character.instance;
	}

	updateCharacter(pressedKeys) {
		var oldPosition = this.position.clone();

		// left
		if (pressedKeys.indexOf(65) != -1 && !this.block.left) {
			this.position.x -= this.speed;
			this.movingLeft = true;
		} else {
			this.movingLeft = false;
		}
		// up
		if (pressedKeys.indexOf(87) != -1 && !this.block.up) {
			this.position.y -= this.speed;
			this.movingUp = true;
		} else {
			this.movingUp = false;
		}
		// right
		if (pressedKeys.indexOf(68) != -1 && !this.block.right) {
			this.position.x += this.speed;
			this.movingRight = true;
		} else {
			this.movingRight = false;
		}
		// down
		if (pressedKeys.indexOf(83) != -1 && !this.block.down) {
			this.position.y += this.speed;
			this.movingDown = true;
		} else {
			this.movingDown = false;
		}

		//this.moving = this.movingDown || this.movingRight || this.movingUp || this.movingLeft;
		this.moving = pressedKeys.indexOf(65) != -1 || pressedKeys.indexOf(87) != -1 || pressedKeys.indexOf(68) != -1 || pressedKeys.indexOf(83) != -1;

		/*
		 * Shooting projectiles
		 */
		var direction = "";
		for (var i = pressedKeys.size(); i >= 0; i--) {
			// Left projectile
			if (pressedKeys.get(i) == 37) {
				direction = "left";
				break;
			}
			// Up projectile
			else if (pressedKeys.get(i) == 38) {
				direction = "up";
				break;
			}
			// Right projectile
			else if (pressedKeys.get(i) == 39) {
				direction = "right";
				break;
			}
			// Down projectile
			else if (pressedKeys.get(i) == 40) {
				direction = "down";
				break;
			}
		}

		/*
		 * Shooting modes: single shot, burst shot, machine
		 */
		if (this.attackCooldown == 0) {
			if (this.singleShot) {
				if (direction != "") {
					if (!this.recentlyShot) {
						Character.getInstance()[this.attackType](direction);
						this.recentlyShot = true;
					}
				} else {
					this.recentlyShot = false;
				}
			} else if (this.burstShot) {
				if (direction != "") {
					if (!this.recentlyShot) {
						this.burstCount = this.burst;
						this.recentlyShot = true;
					}
					if (this.burstCount > 0) {
						Character.getInstance()[this.attackType](direction);
						this.burstCount -= 1;
					}
				} else {
					this.recentlyShot = false;
				}
			} else if (this.machineShot) {
				if (direction != "") {
					Character.getInstance()[this.attackType](direction);
				}
			}
		}

		if(this.attackCooldown > 0)
			this.attackCooldown -= 1;

		/*
		 * Rotate to moving direction
		 */
		if (direction) {
			this.setAngle(Math.PI / 2 - utils.parseDirection(direction));
		} else if (!this.position.equals(oldPosition)) {
			this.setAngle(utils.upAngle + this.position.getAngle(oldPosition));
		}

	}

	attack1(direction) {
		var x, y, vx, vy, badDirection=false;

		var center = this.getHitboxCenter();
		switch(direction) {
			case "left":
				x = this.position.x - 10;
				y = center.y - 5;
				vx = -this.projectileSpeed;
				vy = 0;
				break;
			case "right":
				x = this.position.x + this.getUnscaledWidth();
				y = center.y - 5;
				vx = this.projectileSpeed;
				vy = 0;
				break;
			case "up":
				x = center.x - 5;
				y = this.position.y - 10;
				vx = 0;
				vy = -this.projectileSpeed;
				break;
			case "down":
				x = center.x - 5;
				y = this.position.y + this.getUnscaledHeight();
				vx = 0;
				vy = this.projectileSpeed;
				break;
			default:
				console.log("Bad projectile direction" + direction);
				badDirection = true;
		}

		if (!badDirection) {
			new Projectile(x, y, this.projectileSize, this.projectileSize, vx, vy, this.projectileDamage, this.projectileColor, true, this.projectileFilename);
			SoundManager.getInstance().playSound("laser");
		}
	}

	attack2(direction) {
		var x, y, vx, vy, angle=Math.PI/6, badDirection=false;

		var center = this.getHitboxCenter();
		switch(direction) {
			case "left":
				x = this.position.x - 10;
				y = center.y - 5;
				vx = -this.projectileSpeed * Math.cos(angle);
				vy = this.projectileSpeed * Math.sin(angle);
				break;
			case "right":
				x = this.position.x + this.getUnscaledWidth();
				y = center.y - 5;
				vx = this.projectileSpeed * Math.cos(angle);
				vy = this.projectileSpeed * Math.sin(angle);
				break;
			case "up":
				x = center.x - 5;
				y = this.position.y - 10;
				vx = this.projectileSpeed * Math.sin(angle);
				vy = -this.projectileSpeed * Math.cos(angle);
				break;
			case "down":
				x = center.x - 5;
				y = this.position.y + this.getUnscaledHeight();
				vx = this.projectileSpeed * Math.sin(angle);
				vy = this.projectileSpeed * Math.cos(angle);
				break;
			default:
				console.log("Bad projectile direction " + direction);
				badDirection = true;
		}

		if (!badDirection) {
			switch(direction) {
				case "left":
				case "right":
					new Projectile(x, y, this.projectileSize, this.projectileSize, vx, -vy, this.projectileDamage, this.projectileColor, true, this.projectileFilename);
					new Projectile(x, y, this.projectileSize, this.projectileSize, vx, vy, this.projectileDamage, this.projectileColor, true, this.projectileFilename);
					SoundManager.getInstance().playSound("laser");
					break;
				case "up":
				case "down":
					new Projectile(x, y, this.projectileSize, this.projectileSize, -vx, vy, this.projectileDamage, this.projectileColor, true, this.projectileFilename);
					new Projectile(x, y, this.projectileSize, this.projectileSize, vx, vy, this.projectileDamage, this.projectileColor, true, this.projectileFilename);
					SoundManager.getInstance().playSound("laser");
					break;
				default:
			}
		}
	}

	attack3(direction) {
		/*
		var x, y, vx, vy, badDirection=false;

		var center = this.getHitboxCenter();
		switch(direction) {
			case "left":
				x = this.position.x - 10;
				y = center.y - 5;
				vx = -this.projectileSpeed;
				vy = 0;
				break;
			case "right":
				x = this.position.x + this.getUnscaledWidth();
				y = center.y - 5;
				vx = this.projectileSpeed;
				vy = 0;
				break;
			case "up":
				x = center.x - 5;
				y = this.position.y - 10;
				vx = 0;
				vy = -this.projectileSpeed;
				break;
			case "down":
				x = center.x - 5;
				y = this.position.y + this.getUnscaledHeight();
				vx = 0;
				vy = this.projectileSpeed;
				break;
			default:
				console.log("Bad projectile direction" + direction);
				badDirection = true;
		}

		if (!badDirection) {
			new SplitProjectile(x, y, this.projectileSize, this.projectileSize, vx, vy, this.projectileDamage, this.projectileColor, true, this.projectileFilename);
			SoundManager.getInstance().playSound("laser");
		}
		*/
		var x, y, vx, vy, badDirection=false;

		if (this.burstShot) {
			if (this.burstCount == 1)
				this.attackCooldown = this.maxAttackCooldown;
		}
		else {
			this.attackCooldown = this.maxAttackCooldown;
		}

		var center = this.getHitboxCenter();
		switch(direction) {
			case "left":
				x = this.position.x - 10;
				y = center.y - 5;
				vx = -this.projectileSpeed;
				vy = 0;
				break;
			case "right":
				x = this.position.x + this.getUnscaledWidth();
				y = center.y - 5;
				vx = this.projectileSpeed;
				vy = 0;
				break;
			case "up":
				x = center.x - 5;
				y = this.position.y - 10;
				vx = 0;
				vy = -this.projectileSpeed;
				break;
			case "down":
				x = center.x - 5;
				y = this.position.y + this.getUnscaledHeight();
				vx = 0;
				vy = this.projectileSpeed;
				break;
			default:
				console.log("Bad projectile direction" + direction);
				badDirection = true;
		}

		if (!badDirection) {
			new Projectile(x, y, this.projectileSize, this.projectileSize, vx*2, vy*2, this.projectileDamage, this.projectileColor, true, this.projectileFilename2, 0.75);
			SoundManager.getInstance().playSound("laser");
		}
	}

	checkBounds() {
		if (this.position.x <= this.xMinBound) {
			this.block.left = true;
			this.position.x = this.xMinBound;
		} else {
			this.block.left = false;
		}
		if (this.position.x >= this.xMaxBound - this.getUnscaledWidth()) {
			this.block.right = true;
			this.position.x = this.xMaxBound - this.getUnscaledWidth();
		} else {
			this.block.right = false;
		}
		if (this.position.y <= this.yMinBound) {
			this.block.up = true;
			this.position.y = this.yMinBound;
		} else {
			this.block.up = false;
		}
		if (this.position.y >= this.yMaxBound - this.getUnscaledHeight()) {
			this.block.down = true;
			this.position.y = this.yMaxBound - this.getUnscaledHeight();
			this.jumped = false;
		} else {
			this.block.down = false;
		}
	}

	reset() {
		this.hp = this.maxHealth;
		this.position = Game.getInstance().midPoint.clone();
	}

	enemyDefeated(gold, exp) {
		console.log("Exp gained: " + exp);
		this.exp += exp;
		if(this.exp >= 100 + ((this.level-1) * 50)) {
			this.exp = 0;
			this.level += 1;
			this.skillPoints += 1;

			var percentHP = (this.hp / this.maxHealth);
			this.maxHealth += 5;
			this.hp = percentHP * this.maxHealth;

			SoundManager.getInstance().playSound("levelup");
		}
	}

	regainHealth(amount) {
		if (this.hp + amount > this.maxHealth) {
			this.hp = this.maxHealth;
		} else {
			this.hp = this.hp + amount;
		}
	}

}