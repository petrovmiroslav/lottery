import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";
import Winner from "./components/Winner/Winner";

const USER_COUNT = 100;
const WINNER_PERCENT = 1 / 3;
const MAX_WINNERS_COUNT = Math.ceil(USER_COUNT * WINNER_PERCENT);
const WINNER_PORTION = 3;

const LOTTERY_DELAY_SEC = 15;
const PICK_WINNER_DELAY_SEC = 1;
const LAST_CURRENT_USER_DELAY_SEC = 5;

const getRandomNumber = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const checkShouldContinueLottery = (
  winnersListLength: number,
  currentRoundWinnersListLength: number,
  minWinnersCount: number
) => winnersListLength + currentRoundWinnersListLength < minWinnersCount;

type User = string;

const USER_LIST: User[] = new Array(USER_COUNT)
  .fill(0)
  .map((_, index) => index.toString());

function App() {
  const [currentRoundWinnersList, setCurrentRoundWinnersList] = useState<
    User[]
  >([]);
  const [winnersList, setWinnersList] = useState<User[]>([]);

  const isMountedRef = useRef(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pickCurrentWinnerRef = useRef(() => {});

  const checkIsVideoPaused = useCallback(() => !!videoRef.current?.paused, []);
  const playVideo = useCallback(() => videoRef.current?.play(), []);
  const stopVideo = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, []);

  const setPickCurrentRoundWinnerTimeout = useCallback(
    () =>
      setTimeout(
        () => pickCurrentWinnerRef.current(),
        PICK_WINNER_DELAY_SEC * 1000
      ),
    []
  );

  const setLotteryTimeout = useCallback(() => {
    setTimeout(() => pickCurrentWinnerRef.current(), LOTTERY_DELAY_SEC * 1000);
  }, []);

  const finishCurrentRound = useCallback(
    (
      winnersListValue: typeof winnersList,
      currentRoundWinnersListValue: typeof currentRoundWinnersList
    ) => {
      if (!isMountedRef.current) return;

      stopVideo();
      setCurrentRoundWinnersList([]);
      setWinnersList([...winnersListValue, ...currentRoundWinnersListValue]);

      checkShouldContinueLottery(
        winnersListValue.length,
        currentRoundWinnersListValue.length,
        MAX_WINNERS_COUNT
      ) && setLotteryTimeout();
    },
    [setLotteryTimeout, stopVideo]
  );

  pickCurrentWinnerRef.current = () => {
    if (!isMountedRef.current) return;

    checkIsVideoPaused() && playVideo();
    const winnerIndex = getRandomNumber(0, USER_LIST.length);
    const winner = USER_LIST[winnerIndex];
    const newCurrentRoundWinnersList = [...currentRoundWinnersList, winner];
    const shouldContinueCurrentRound =
      newCurrentRoundWinnersList.length < WINNER_PORTION &&
      checkShouldContinueLottery(
        winnersList.length,
        newCurrentRoundWinnersList.length,
        MAX_WINNERS_COUNT
      );

    setCurrentRoundWinnersList(newCurrentRoundWinnersList);
    USER_LIST.splice(winnerIndex, 1);

    shouldContinueCurrentRound
      ? setPickCurrentRoundWinnerTimeout()
      : setTimeout(
          () => finishCurrentRound(winnersList, newCurrentRoundWinnersList),
          LAST_CURRENT_USER_DELAY_SEC * 1000
        );
  };

  const Winners = useMemo(
    () => (
      <div className="winners">
        {winnersList
          .map((user, index) => (
            <Winner key={user} index={index + 1} user={user} />
          ))
          .reverse()}
      </div>
    ),
    [winnersList]
  );

  useEffect(() => {
    setLotteryTimeout();
  }, [setLotteryTimeout]);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  return (
    <div className="App">
      <div className="videoContainer">
        <video
          ref={videoRef}
          className="video"
          muted
          loop
          src="https://ak.picdn.net/shutterstock/videos/1011295049/preview/stock-footage-abstract-stars-revolution-loop-abstract-animated-background-with-shining-stars-spinning-around-y.mp4"
        />
      </div>

      <div className="currentRoundWinners">
        {currentRoundWinnersList.map((user, index) => (
          <Winner
            className="winner_currentRound"
            key={user}
            index={winnersList.length + index + 1}
            user={user}
          />
        ))}
      </div>

      {Winners}
    </div>
  );
}
export default App;
