// Velvet Vault — tuning constants (from the design doc, section 2).
export const W = 1280;
export const H = 720;
export const WALL_T = 24;

export const PLAYER_R = 14;
export const WALK_SPEED = 175;
export const SNEAK_SPEED = 88;
export const GUARD_SPEED = 96;
export const CHASE_SPEED = 198;

export const GUARD_RANGE = 220;
export const GUARD_HALF_ANGLE = (35 * Math.PI) / 180;
export const GUARD_SPOT_DIST = 60;
export const GUARD_CATCH_DIST = 26;
export const GUARD_LOSE_TIME = 2.0;
export const GUARD_WAIT_TIME = 1.2;

export const CAM_RANGE = 260;
export const CAM_HALF_ANGLE = (32 * Math.PI) / 180;
export const CAM_SWEEP = 0.85; // radians either side of the base angle
export const CAM_SWEEP_SPEED = 0.55;

export const ALARM_GUARD_RATE = 22;
export const ALARM_CAM_RATE = 34;
export const ALARM_CHASE_RATE = 30;
export const ALARM_DECAY = 6;
export const ALARM_MAX = 100;

export const PAR_TIME = 90;
export const PICKUP_DIST = 32;
export const LOOT_VALUE = { sapphire: 500, painting: 150, coins: 100 };
