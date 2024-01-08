var web3wallet = new web3walletpack(goerli);
var webutils = new webutilspack();

async function connectWallet() {
    document.getElementById(`connectBTN`).innerHTML = `<img src="svg/wallet.svg" width="20" height="20"> Request...`;
    await web3wallet.reqChain();
    await web3wallet.reqAccount();
    const accounts = await web3wallet.getAccounts();
    document.getElementById(`connectBTN`).innerHTML = `<img src="svg/wallet.svg" width="20" height="20"> ${web3wallet.shortAddr(accounts[0])}`;
    webutils.setCookie(`connstatus`,`connected`,`365`);
    webutils.activeBTN(`disconnectBTN`,true);
    await update();
}

async function disconnectWallet() {
    document.getElementById(`connectBTN`).innerHTML = `<img src="svg/wallet.svg" width="20" height="20"> Connect Wallet`;
    webutils.setCookie(`connstatus`,`disconnected`,`365`);
    webutils.activeBTN(`disconnectBTN`,false);
}

window.onload = async function () {
    await fetchReferralLink();
    const connstatus = webutils.getCookie(`connstatus`);
    console.log("connstatus : " + connstatus);
    if(connstatus==`connected`){
        await connectWallet(`connectBTN`);
    }else{
        await update();
    }
}

async function fetchReferralLink() {
    const ref = webutils.fetchURLparams(`ref`);
    console.log(`Fetch[ref]: ` + ref);
    try{
        const user = await web3wallet.contract(USER.address,USER.abi);
        const getUserData = await user.methods.getUserData(ref).call();
        document.getElementById(`registerInput`).value = getUserData.id;
    }catch(err){ console.log(err); }
}

async function update() {
    try{ await update_account(); }catch(err){ console.log(err); }
    try{ await update_mint(); }catch(err){ console.log(err); }
}

async function update_account() {
    const account = await web3wallet.getCurrentAccount();
    const user = await web3wallet.contract(USER.address,USER.abi);
    const getUserData = await user.methods.getUserData(account).call();
    if(getUserData.registered){
        document.getElementById(`registerPage`).style.display = "none";
        document.getElementById(`registeredPage`).style.display = "flex";
        webutils.activeBTN(`copyBTN`,true);
        await update_account_detail(user);
    }else{
        document.getElementById(`registerPage`).style.display = "flex";
        document.getElementById(`registeredPage`).style.display = "none";
        webutils.activeBTN(`copyBTN`,false);
    }
}

async function update_account_detail(user) {
    const account = await web3wallet.getCurrentAccount();
    const getUserData = await user.methods.getUserData(account).call();
    const getReferralData = await user.methods.getUserData(getUserData.referral).call();
    const getUserReferees = await user.methods.getUserReferees(account,0).call();
    document.getElementById(`accountAddress`).innerHTML = `${web3wallet.shortAddr(account)} ( Id:${getUserData.id} )`;
    document.getElementById(`referralAddress`).innerHTML = `${web3wallet.shortAddr(getUserData.referral)} ( Id:${getReferralData.id} )`;
    document.getElementById(`directPartners`).innerHTML = `${getUserReferees.length}`;
}

async function register() {
    const account = await web3wallet.getCurrentAccount();
    const user = await web3wallet.contract(USER.address,USER.abi);
    const minter = await web3wallet.contract(MINTER.address,MINTER.abi);
    const inputId = document.getElementById('registerInput').value;
    const refAddress = await user.methods.id2address(inputId).call();
    //
    const tx = {
        from: account,
        value: 0,
        to: MINTER.address,
        data: minter.methods.register(account,refAddress).encodeABI()
    };
    //
    const transactionHash = web3.eth.sendTransaction(tx);
    transactionHash.on("receipt", receipt => {
        alert("Transaction Submit!");
        console.log(receipt);
        update();
    });
    transactionHash.on("error", err => {
        alert(err.message);
        console.log(err);
    });
}

async function copyLink() {
    const account = await web3wallet.getCurrentAccount();
    const appURL = `http://127.0.0.1:5500/app.html?ref=`;
    document.getElementById(`refLink`).innerHTML = `${appURL}${account}`;
    webutils.copyToClipboard(`refLink`,`Copied!`);
}

async function displaySection(asset,mint,marketplace) {
    document.getElementById(`renderAsset`).style.display = asset;
    document.getElementById(`renderMint`).style.display = mint;
    document.getElementById(`renderMarket`).style.display = marketplace;
}

async function update_mint() {
    const account = await web3wallet.getCurrentAccount();
    let assetHolding = 0;
    for(let i = 0; i < NFT.address.length; i++) {
        const nft = await web3wallet.contract(NFT.address[i],NFT.abi);
        const totalSupply = await nft.methods.totalSupply().call();
        const maxSupply = await nft.methods.maxSupply().call();
        const balanceOf = await nft.methods.balanceOf(account).call();
        assetHolding = parseInt(assetHolding) + parseInt(balanceOf);
        document.getElementById(`nftSupply${i}`).innerHTML = `${totalSupply}/${maxSupply}`;
    }
    document.getElementById(`assetHolding`).innerHTML = `${assetHolding}`;
}

async function mintNft(typeNft) {
    const account = await web3wallet.getCurrentAccount();
    const minter = await web3wallet.contract(MINTER.address,MINTER.abi);
    const usdt = await web3wallet.contract(USDT.address,USDT.abi);
    const getNftData = await minter.methods.getNftData().call();
    const allowance = await usdt.methods.allowance(account,MINTER.address).call();
    
    if(Number(getNftData[2][typeNft])>Number(allowance)){
        const tx = {
            from: account,
            to: USDT.address,
            data: usdt.methods.approve(MINTER.address,getNftData[2][typeNft]).encodeABI()
        };
        const transactionHash = await web3.eth.sendTransaction(tx);
    }

    const tx = {
        from: account,
        value: 0,
        to: MINTER.address,
        data: minter.methods.mintNft(account,typeNft).encodeABI()
    };

    const transactionHash = web3.eth.sendTransaction(tx);
    transactionHash.on("receipt", receipt => {
        alert("Transaction Submit!");
        console.log(receipt);
        update();
    });
    transactionHash.on("error", err => {
        alert(err.message);
        console.log(err);
    });
}