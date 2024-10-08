import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import Nickname from './Nickname';
import GameBoardContainer from './GameBoardContainer';
import GameOverModalContainer from './GameOverModalContainer';
import GameAnimationContainer from './GameAnimationContainer';
import Sounds from './Sounds';
import Controls from './Controls';
import ScoreDisplay from './ScoreDisplay';
import moveSound from '../sounds/move.mp3';
import rotateSound from '../sounds/rotate.mp3';
import dropSound from '../sounds/drop.mp3';
import ScoreDesk from './ScoreDesk';

const Tetris = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.game);
  const {
    score, started, lastScore,
  } = gameState;
  const scoreDesk = useSelector((state) => state.game.scoreDesk);
  const sounds = Sounds({ moveSound, rotateSound, dropSound });
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showNickNameModal, setShowNickNameModal] = useState(true);

  useEffect(() => { setShowNickNameModal(true); }, []);

  return (
    <div className="main-container">
      <Nickname
        dispatch={dispatch}
        showNickNameModal={showNickNameModal}
        setShowNickNameModal={setShowNickNameModal}
      />
      <div className="game-content">
        <div className="header-container">
          <div className="header-content">
            <Header />
            <ScoreDisplay score={score} started={started} dispatch={dispatch} />
          </div>
        </div>
        <GameBoardContainer gameState={gameState} />
        {gameState.gameIsOver && (
        <GameOverModalContainer
          score={lastScore}
          dispatch={dispatch}
          showGameOverModal={showGameOverModal}
          setShowGameOverModal={setShowGameOverModal}
        />
        )}
        <ScoreDesk scoreDesk={scoreDesk} />
      </div>
      <Controls gameState={gameState} dispatch={dispatch} sounds={sounds} />
      <GameAnimationContainer
        dispatch={dispatch}
        gameState={gameState}
        setShowGameOverModal={setShowGameOverModal}
      />
    </div>
  );
};

export default Tetris;
