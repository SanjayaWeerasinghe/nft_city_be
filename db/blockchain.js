
const { ApiPromise, WsProvider } = require('@polkadot/api');
const Web3 = require("web3");
const web3 = new Web3();

const newNucConnection = async (WS_URI) => {
    return new Promise(async (resolve, reject) => {
        const wsProvider = new WsProvider(WS_URI);

        wsProvider.on('error', (e) => {
            console.error('NUC WsProvider error (auto-reconnecting):', e.message || e);
        });

        wsProvider.on('disconnected', () => {
            console.warn('NUC WsProvider disconnected — waiting for auto-reconnect...');
        });

        const api = new ApiPromise({ provider: wsProvider });

        api.on('error', (e) => {
            console.error('NUC ApiPromise error (non-fatal):', e.message || e);
        });

        try {
            await api.isReadyOrError;
            global.api = api;
            resolve();
        } catch (e) {
            console.error('NUC Connection Failed:', e.message || e);
            reject(e);
        }
    })
};
const getNucConnection = () => global.api;


module.exports = {newNucConnection,getNucConnection }