import { Wallet } from "ethers";
import { Result } from "ethers/lib/utils";
import { default as axios } from "axios";
import * as bs58 from "bs58";

import postToDiscord from "../utils/postToDiscord";
import postToSlack from "../utils/postToSlack";
import { postToSnapshotBlocknum } from "../utils/postToSnapshot";
import { watch } from "../utils/watcher";
import getQuorum from "../utils/getQuorum";

require("dotenv").config();


export const watchDydx = async () => {

    const eventName = "ProposalCreated";
    const eventSignature = "ProposalCreated(uint256,address,address,address[],uint256[],string[],bytes[],bool[],uint256,uint256,address,bytes32)";
    const eventReadable = ["event ProposalCreated(uint256 id,address indexed creator, address indexed executor, address[] targets, uint256[] values,string[] signatures,bytes[] calldatas,bool[] withDelegatecalls,uint256 startBlock,uint256 endBlock,address strategy,bytes32 ipfsHash)"];

    watch(process.env.DYDX_GOVERNANCE_ADDRESS, eventName, eventSignature, eventReadable, onEvent);
}

const onEvent = async (event: Result, signer: Wallet, spaceName: string, webhook: string) => {
    const id = event.id.toNumber();
    const endBlock = event.endBlock.toNumber();
    const propIpfsRaw = event.ipfsHash.replace("0x", "");

    const bytes = Buffer.from("1220" + propIpfsRaw, 'hex');
    const propIpfs = bs58.encode(bytes);
    
    const res = await axios.get("https://ipfs.io/ipfs/" + propIpfs);
    const titleRaw = res.data.title;
    const title = titleRaw.length < 250 ? titleRaw : "";
    const dip = res.data.dip;

//     const quorum = await getQuorum();
//     const ipfsHash = await makeDydxSnapshot(signer, id, dip, propIpfs, title, endBlock, spaceName, quorum);
    await messageDiscord(dip, title, id, propIpfs, webhook);

//     console.log(ipfsHash);
}

// const makeDydxSnapshot = async (
//   signer: Wallet,
//   id: number,
//   dip: number,
//   hash: string,
//   propTitle: string,
//   endBlock: number,
//   spaceName: string,
//   quorum: string
// ) => {

//     const description = `This proposal is for voting on DyDx's proposal #${dip} using DPI. Please review the proposal here: https://dydx.community/dashboard/proposal/${id} \n\n Quorum for this vote is ${quorum} INDEX.`
//     const title = `[DYDX-${dip}] ${propTitle}`

//     return postToSnapshotBlocknum(signer, title, description, endBlock, spaceName, ["For","Against"]);
// }

const messageDiscord = async (
    dip: number, 
    title: string, 
    id: number, 
    hash: string, 
    webhook: string
) => {
    const message = `A new proposal has been created for [DYDX-${dip}] ${title}. Please review the proposal here: https://dydx.community/dashboard/proposal/${id}.`
    return await postToDiscord(message, webhook);
}
