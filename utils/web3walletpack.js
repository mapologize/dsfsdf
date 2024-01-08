class web3walletpack {
    constructor(chain){
        this.accounts = [];
        this.chainId = chain.chainId;
        this.chainName = chain.chainName;
        this.rcp = chain.rcp;
        this.currency = chain.currency;
        this.explorer = chain.explorer;
        if(window.ethereum){
            window.web3 = new Web3(window.ethereum);
        }else{
            window.web3 = new Web3(chain.rcp);
        }
    }

    async getBlock() {
        return await web3.eth.getBlock("latest");
    }

    async getGasPrice() {
        return await web3.eth.getGasPrice();
    }

    async reqAccount(){
        await window.ethereum.request({ method: `eth_requestAccounts` });
    }

    async getAccounts() {
        const accounts = await window.web3.eth.getAccounts();
        this.accounts = accounts;
        return accounts;
    }

    async getCurrentAccount() {
        const accounts = await window.web3.eth.getAccounts();
        this.accounts = accounts;
        return accounts[0];
    }

    async reqChain() {
        const data = [{
            chainId: this.chainId,
            chainName: this.chainName,
            nativeCurrency: this.currency,
            rpcUrls: [this.rcp],
            blockExplorerUrls: [this.explorer],
        }]
        await window.ethereum.request({method: 'wallet_addEthereumChain', params:data});
    }

    async contract(address,abi) {
        return await new window.web3.eth.Contract(abi, address);
    }

    shortAddr(address) {
        if(address==null){ return `null`;}
        if(address==undefined){ return `undefined`;}
        if(address.length!=42){ return `error`;}
        let resulta = address.substring(0, 4);
        let resultb = address.substring(38, 42);
        return `${resulta}...${resultb}`
    }
}