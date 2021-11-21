import { watchAave } from "./protocols/aave";
import { watchCompound } from "./protocols/compound"
import { watchUniswap } from "./protocols/uniswap";
import { watchDydx } from "./protocols/dydx";
import {SnapshotMirror } from "./snapshotMirror/snapshotMirror";

require("dotenv").config();

watchCompound();
watchAave();
watchUniswap();
watchDydx();

const mirror = new SnapshotMirror(process.env.WATCHED_SPACES.split(","));
mirror.watchSnapshot();

console.log("watching for new proposals...")
