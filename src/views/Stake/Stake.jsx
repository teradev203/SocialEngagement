import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import NewReleases from "@material-ui/icons/NewReleases";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import { getOhmTokenImage, getTokenImage, trim } from "../../helpers";
import { changeApproval, changeStake, claimReward } from "../../slices/StakeThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./stake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import ExternalStakePool from "./ExternalStakePool";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";
import ClaimTimer from "../../components/RebaseTimer/ClaimTimer";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const sOhmImg = getTokenImage("sohm");
const ohmImg = getOhmTokenImage(16, 16);

function Stake() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainID } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [open, setOpen] = useState(false);
  const [emergency, setEmergency] = useState(false);

  const isAppLoading = useSelector(state => state.app.loading);
  
  const kageBalance = useSelector(state => {
    return state.account.staking && state.account.staking.kageBalance;
  });
  const isClaimable = useSelector(state => {
    return state.account.balances && state.account.balances.isClaimable;
  });
  const stakedBalance = useSelector(state => {
    return state.account.staking && state.account.staking.stakedBalance;
  });
  
  const kageAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.kageAllowance;
  });

  const kageEarned = useSelector(state => {
    return state.account.staking && state.account.staking.kageEarned;
  });

  const pendingAmount = useSelector(state => {
    return state.account.staking && state.account.staking.pendingToken;
  });

  const stakingTVL = useSelector(state => {
    return state.account.staking && state.account.staking.totalStaked;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(kageBalance);
    } else {
      setQuantity(stakedBalance);
    }
  };

  const onSeekApproval = async token => {
    await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
  };

  const onChangeStake = async (action, emergency) => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0 || quantity === "" || !quantity) {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(kageBalance, "gwei"))) {
      return dispatch(error("You cannot stake more than your Meme Kong balance."));
    }

    if (action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(stakedBalance, "gwei"))) {
      return dispatch(error("You cannot unstake more than your Meme Kong balance."));
    }

    await dispatch(changeStake({ address, action, emergency, value: quantity.toString(), provider, networkID: chainID }));

    setOpen(false);
  };

  const onClaimReward = async action => {
    await dispatch(claimReward({ address, action, value: quantity.toString(), provider, networkID: chainID }));
  };

  const hasAllowance = useCallback(
    token => {
      return kageAllowance > 0;
    },
    [kageAllowance],
  )

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  )

  const changeView = (event, newView) => {
    setView(newView);
  }

  const trimmedBalance = Number(
    [stakedBalance]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );

  const SwapAlertDialog = ({setOpen, setEmergency}) => {

    return (
      <div style={{ background: "#ff0 !important" }}>
        <Dialog
          open={open}
          onClose={()=>{close()}}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" style={{ textAlign: "center" }}>
            <span style={{ color: "#fff", fontSize: "22px" }}>Select UnStaking Option</span>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Typography style={{ color: "#fff", fontSize: "20px" }}>- <span style={{color:"yellow"}}>UnStake</span> tokens will allow you get Meme Kong tokens 7 days later.</Typography>
              <Typography style={{ color: "#fff", fontSize: "20px", paddingTop: "10px" }}>- <span style={{color:"yellow"}}>Emergency Withdraw </span> will allow you get Meme Kong tokens immediately with 5% fee.</Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" color="secondary" onClick={()=>{setOpen(false);}}>
              Cancel
            </Button>
            <Button variant="outlined" color="secondary" onClick={()=>{onChangeStake("unstake", false);}}>
              UnStake
            </Button>
            <Button variant="outlined" color="secondary" onClick={()=>{onChangeStake("unstake", true);}} autoFocus>
              Emergency
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };

  return (
    <div id="stake-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper className={`ohm-card`} style={{border: "1px solid #4c646e85", background: "#131339"}}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <div className="card-header">
                <Typography variant="h3">Stake </Typography>
              </div>
            </Grid>

            <Grid item>
              <div className="stake-top-metrics">
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <div className="stake-apy">
                      <Typography variant="h4" color="textSecondary">
                        APY
                      </Typography>
                      <Typography variant="h3" style={{color: "#965E96", fontWeight: "bold"}}>
                        18%
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <div className="stake-tvl">
                      <Typography variant="h4" color="textSecondary">
                        Total Value Deposited
                      </Typography>
                      <Typography variant="h3" style={{color: "#965E96", fontWeight: "bold"}}>
                        {stakingTVL ? (
                          new Intl.NumberFormat("en-US", {
                            maximumFractionDigits: 0,
                            minimumFractionDigits: 0,
                          }).format(stakingTVL) + ' Meme Kong'
                        ) : (
                          <Skeleton width="150px" />
                        )}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <div className="staking-area">
              {!address ? (
                <div className="stake-wallet-notification">
                  <div className="wallet-menu" id="wallet-menu">
                    {modalButton}
                  </div>
                  <Typography variant="h6">Connect your wallet to stake Meme Kong</Typography>
                </div>
              ) : (
                <>
                  <Box className="stake-action-area">
                    <Tabs
                      key={String(zoomed)}
                      centered
                      value={view}
                      textColor="primary"
                      indicatorColor="primary"
                      className="stake-tab-buttons"
                      onChange={changeView}
                      aria-label="stake tabs"
                    >
                      <Tab label="Stake" {...a11yProps(0)} />
                      <Tab label="Withdraw" {...a11yProps(1)} />
                      <Tab label="Claim" {...a11yProps(2)} />
                    </Tabs>
                    <Box className="help-text">
                      {address && ((!hasAllowance("ohm") && view === 0) || (!hasAllowance("sohm") && view === 1)) && (
                        <Typography variant="body1" className="stake-note" color="textSecondary">
                          Note: The "Approve" transaction is only needed when staking/unstaking for the first time;
                        </Typography>
                      )}
                    </Box>
                    <Box className="stake-action-row " display="flex" alignItems="center">
                      {
                        view != 2 ?
                          <FormControl className="ohm-input" variant="outlined" color="primary">
                            <InputLabel htmlFor="amount-input"></InputLabel>
                            <OutlinedInput
                              id="amount-input"
                              type="number"
                              placeholder="Enter an amount"
                              className="stake-input"
                              value={quantity}
                              onChange={e => setQuantity(e.target.value)}
                              labelWidth={0}
                              endAdornment={
                                <InputAdornment position="end">
                                  <Button variant="text" onClick={setMax} color="inherit">
                                    Max
                                  </Button>
                                </InputAdornment>
                              }
                            />
                          </FormControl> : <></>
                      }
                      <TabPanel value={view} index={0} className="stake-tab-panel">
                        {address && hasAllowance("ohm") ? (
                          <Button
                            className="stake-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "staking")}
                            onClick={() => {
                              onChangeStake("stake", false);
                            }}
                          >
                            {txnButtonText(pendingTransactions, "staking", "Stake Meme Kong")}
                          </Button>
                        ) : (
                          <Button
                            className="stake-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "approve_staking")}
                            onClick={() => {
                              onSeekApproval("ohm");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "approve_staking", "Approve")}
                          </Button>
                        )}

                      </TabPanel>

                      <TabPanel value={view} index={1} className="stake-tab-panel">
                        <Button
                          className="stake-button"
                          variant="contained"
                          color="primary"
                          disabled={isPendingTxn(pendingTransactions, "unstaking")}
                          onClick={() => {
                            setOpen(true);
                          }}
                        >
                          {txnButtonText(pendingTransactions, "unstaking", "Withdraw Meme Kong")}
                        </Button>
                      </TabPanel>
                      <TabPanel value={view} index={2} className="stake-tab-panel">
                        <Button
                          className="stake-button"
                          variant="contained"
                          color="primary"
                          disabled={isPendingTxn(pendingTransactions, "claiming") | !isClaimable}
                          onClick={() => {
                            onClaimReward();
                          }}
                        >
                          {txnButtonText(pendingTransactions, "unstaking", "Claim Meme Kong")}
                        </Button>
                      </TabPanel>
                    </Box>
                  </Box>

                  <div className={`stake-user-data`}>
                    <div className="data-row">
                      <Typography variant="body3">Your Balance</Typography>
                      <Typography variant="body3">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(kageBalance, 3)} Meme Kong</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body3">Your Staked Balance</Typography>
                      <Typography variant="body3">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trimmedBalance} Meme Kong</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body3">Claimable Reward Amount</Typography>
                      <Typography variant="body3">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(kageEarned, 2)} Meme Kong</>}
                      </Typography>
                    </div>
                    <div className="data-row">
                      <Typography variant="body3">UnStake CoolDown</Typography>
                      <Typography variant="body3">
                        {isAppLoading ? <Skeleton width="80px" /> : <>7 days</>}
                      </Typography>
                    </div>
                    <div className="data-row">
                      <Typography variant="body3">Pending Amount</Typography>
                      <Typography variant="body3">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(pendingAmount, 2)} Meme Kong</>}
                      </Typography>
                    </div>
                    <div className="data-row">
                      <Typography variant="body3">Time to Claiming</Typography>
                      <Typography variant="body3">
                        {isAppLoading ? <Skeleton width="80px" /> : <ClaimTimer/>}
                      </Typography>
                    </div>
                    <div className="data-row">
                      <Typography variant="body3">Emergency Withdraw Fee</Typography>
                      <Typography variant="body3">
                        {isAppLoading ? <Skeleton width="80px" /> : <> 5%</>}
                      </Typography>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Grid>
        </Paper>
      </Zoom>
      {open && (
        <SwapAlertDialog
          setOpen={setOpen}
          setEmergency={setEmergency}
        />
      )}
      {/* <ExternalStakePool /> */}
    </div>
  );
}

export default Stake;
