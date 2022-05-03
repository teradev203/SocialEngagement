import { useSelector, useDispatch } from "react-redux";
import { getRebaseBlock, secondsUntilBlock, prettifySeconds_ } from "../../helpers";
import { Box, Typography } from "@material-ui/core";
import "./rebasetimer.scss";
import { Skeleton } from "@material-ui/lab";
import { useEffect, useMemo, useState } from "react";
import { loadAppDetails } from "../../slices/AppSlice";
import { useWeb3Context } from "../../hooks/web3Context";
import { getBalances } from "src/slices/AccountSlice";

function ClaimTimer() {
  // const dispatch = useDispatch();
  // const { provider, address } = useWeb3Context();
  // const networkId = useSelector(state => state.network.networkId);

  const SECONDS_TO_REFRESH = 60;
  const MIN_LOCKTIME = 360000000;
  const [rebaseString, setRebaseString] = useState("");
  const [secondsToRefresh, setSecondsToRefresh] = useState(SECONDS_TO_REFRESH);
  const [calcTime, setCalcTime] = useState(0);

  const timeDiff2Claim = useSelector(state => {
    return state.account.staking && state.account.staking.timeDiff2Claim;
  });

  useEffect(() => {
    console.log("[tz]==> initializetimer, timeDiff2Claim: ", timeDiff2Claim);
    setCalcTime(timeDiff2Claim);
    const prettified = prettifySeconds_(calcTime);
    setRebaseString(prettified !== "" ? prettified : "Finished");
  }, [timeDiff2Claim]);

  useEffect(() => {
    let interval = null;
    if (calcTime == 999999 ){
      setRebaseString("--- ");
      clearInterval(interval);
    }
    else if (calcTime) {
      interval = setInterval(() => {
        setCalcTime(calcTime => calcTime - 1);
        const prettified = prettifySeconds_(calcTime);
        setRebaseString(prettified !== "" ? prettified : "Claimable Now");
      }, 1000);
    }
    else {
      // When the countdown goes negative, reload the app details and reinitialize the timer
      setRebaseString("Claimable Now");
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [calcTime]);

  return (
    <Box className="rebase-timer">
      <div style={{fontSize: "20px"}}>
        {timeDiff2Claim ? (
          timeDiff2Claim > 0 ? (
            <>
              {rebaseString}&nbsp;
            </>
          ) : (
            <>
              Claimable Now
            </>
          )
        ) : (
          <Skeleton width="155px" />
        )}
      </div>
    </Box>
  );
}

export default ClaimTimer;
