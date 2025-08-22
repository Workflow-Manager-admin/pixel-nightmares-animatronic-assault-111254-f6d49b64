export const Weapons = {
  TASER: 'taser',
  AK: 'ak',
  RPG: 'rpg',
};

let lastTaser = 0;
let lastAK = 0;
let lastRPG = 0;

// PUBLIC_INTERFACE
export const weaponMeta = {
  [Weapons.TASER]: {
    name: 'Taser',
    damage: 12,
    speed: 3.0,
    life: 400,
    recoil: 0.1,
    spread: 0.02,
    consume: 0,
    trailColor: '#7dd3fc',
    canShoot: (_ammo, now) => {
      if (now - lastTaser >= 140) {
        lastTaser = now;
        return true;
      }
      return false;
    },
  },
  [Weapons.AK]: {
    name: 'AK-47',
    damage: 10,
    speed: 3.6,
    life: 600,
    recoil: 0.05,
    spread: 0.08,
    consume: 1,
    trailColor: '#f59e42',
    canShoot: (ammo, now) => {
      if (ammo <= 0) return false;
      if (now - lastAK >= 110) {
        lastAK = now;
        return true;
      }
      return false;
    },
  },
  [Weapons.RPG]: {
    name: 'RPG',
    damage: 60,
    speed: 2.0,
    life: 900,
    recoil: 0.6,
    spread: 0.02,
    consume: 1,
    size: 3,
    trailColor: '#fde047',
    canShoot: (ammo, now) => {
      if (ammo <= 0) return false;
      if (now - lastRPG >= 850) {
        lastRPG = now;
        return true;
      }
      return false;
    },
  },
};
