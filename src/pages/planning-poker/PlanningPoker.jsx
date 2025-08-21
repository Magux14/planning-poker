import { useEffect, useRef, useState } from 'react';
import { usePlanningPoker } from '../../hooks/useFirebase';
import { Modal } from 'antd';
import { Spin } from 'antd';
import DeleteIcon from '@mui/icons-material/Delete';
import './planning-poker.scss'

const cards = ['1', '2', '3', '5', '8', '13'];

const defaultGameState = {
    sessionId: '',
    userId: '',
    name: '',
    vote: null,
    isAdmin: false,
    revealVotes: false
}

export const PlanningPoker = () => {
    const [gameState, setGameState] = useState(defaultGameState);
    const { users, vote, clearVotes, revealVotesForEveryone, removeUser } = usePlanningPoker(gameState);
    const [selectedVote, setSelectedVote] = useState(null);
    const [kickedOff, setKickedOff] = useState(null);
    const prevVoteRef = useRef();

    const handleVote = (card) => {
        setSelectedVote(card);
        vote(card);
    };

    const handleClearVotes = () => {
        handleRevealVotes(false);
        clearVotes();
        setSelectedVote(null);
    };

    const initSession = () => {
        let sessionId;
        const query = new URLSearchParams(window.location.search);
        const roomByParam = query.get('room');
        if (roomByParam) {
            sessionId = roomByParam;
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            sessionId = `${year}${month}${day}`;
        }

        setGameState({
            ...gameState,
            name: gameState.name.toLowerCase(),
            userId: gameState.name.toLowerCase(),
            sessionId
        })
    }

    const handleSetGameStateProperty = (property, value) => {
        setGameState({
            ...gameState,
            [property]: value
        })
    }

    const handleRevealVotes = (reveal) => {
        revealVotesForEveryone(reveal);
    }

    const showVotesAnyUser = () => {
        let revealVotes = false;
        for (const uuid in users) {
            if (users[uuid] && users[uuid].isAdmin && users[uuid].revealVotes) {
                revealVotes = true;
            }

        }
        return revealVotes;
    }

    const getAverageValue = () => {
        let points = 0;
        let playersNum = 0;
        for (const uuid in users) {
            if (users[uuid]?.vote && !isNaN(Number(users[uuid].vote))) {
                playersNum++;
                points += Number(users[uuid].vote);
            }
        }
        return playersNum == 0 ? 0 : (points / playersNum).toFixed(1);
    }

    const checkIfKickedOut = () => {
        let kickedOut = true;
        for (const uuid in users) {
            if (users[uuid]?.userId && users[uuid].userId == gameState.userId) {
                return false;
            }
        }
        return kickedOut;
    }

    const getIconByCard = (num) => {
        if (num == 1) {
            return 'diamantes';
        } else if (num == 2) {
            return 'treboles';

        } else if (num == 3) {
            return 'espadas';

        } else if (num == 5) {
            return 'corazones';

        } else if (num == 8) {
            return 'treboles';

        } else if (num == 13) {
            return 'corazones';

        } else {
            return 'espadas';
        }
    }

    useEffect(() => {
        if (gameState.userId) {
            const kickedOut = checkIfKickedOut();
            if (kickedOut) {
                setKickedOff(kickedOut);
            }
        }
    }, [Object.entries(users).length])

    useEffect(() => {

        if (gameState.userId) {
            if (prevVoteRef.current && !users[gameState.userId].vote) {
                setSelectedVote(null);
            }

            prevVoteRef.current = users[gameState.userId].vote;
        }

    }, [users]);

    // useEffect(() => {

    // }, users[gameState.userId].vote)

    const showVotes = showVotesAnyUser();
    const avegare = getAverageValue();

    return (
        <div className="planning-poker__container">
            <Modal
                open={!gameState.sessionId}
                footer={null}
                className="inventory__modal"
                centered={true}
                destroyOnClose={true}
                closable={false}
            >
                <div className="planning-poker__fields-container">
                    <div className="planning-poker__field-container--column">
                        <div className="planning-poker__players-label" >Name</div>
                        <input type="textjak" className="planning-poker__players-input" value={gameState.name} onChange={($ev) => handleSetGameStateProperty('name', $ev.target.value)}></input>
                    </div>
                    <div className="planning-poker__field-container">
                        <span>I'm the Admin</span>
                        <input type="checkbox" className="planning-poker__players-input" checked={gameState.isAdmin} onChange={($ev) => handleSetGameStateProperty('isAdmin', $ev.target.checked)}></input>
                    </div>
                    <div className="planning-poker__button-join-container">
                        <button className="planning-poker__button-join" onClick={initSession} disabled={!gameState.name}>Join</button>

                    </div>
                </div>
            </Modal >

            <Modal
                open={kickedOff}
                footer={null}
                className="inventory__modal"
                centered={true}
                destroyOnClose={true}
                closable={false}
            >
                <div className="planning-poker__kickedoff-container">

                    <div>
                        You have been kicked out of this room, please refresh the page
                    </div>
                    <span className="planning-poker__kickedoff-face">
                        🙃
                    </span>

                </div>
            </Modal >

            {
                gameState.sessionId && !kickedOff &&
                <>
                    <div className="planning-poker__banner-container">
                        <h1>Planning Poker</h1>
                        <h4>Room: "{gameState.sessionId}"</h4>
                    </div>

                    <div className="planning-poker__elements-container">
                        <div className="planning-poker__element-players">
                            <div className="planning-poker__players-title-container planning-poker__casino-text">PLAYERS:</div>
                            <div className="planning-poker__players-container">
                                {Object.entries(users).map(([uid, user]) => (
                                    <div className={`planning-poker__player ${gameState.name == user.name ? 'planning-poker__player--me' : ''}`} key={uid}>
                                        <div className="planning-poker__player-name-container">
                                            {
                                                gameState.isAdmin &&
                                                <button className="planning-poker__delete-user-button" onClick={() => removeUser(user.userId)}><DeleteIcon /></button>
                                            }
                                            <span className="planning-poker__player-name" style={{ textTransform: 'capitalize' }}>
                                                {user.name}
                                                {
                                                    user.isAdmin &&
                                                    <span className="planning-poker__player-admin-label">
                                                        Admin
                                                    </span>
                                                }
                                            </span>
                                        </div>
                                        {
                                            !showVotes &&
                                            <div className="planning-poker__voting-status">
                                                {user.vote ? `✅` : <><Spin /> voting...</>}
                                            </div>
                                        }
                                        {
                                            showVotes &&
                                            <div className={`planning-poker__voting-status planning-poker__voting-status--show-votes ${!user.vote ? 'planning-poker__voting-status--didnt-vote' : ''}`}>
                                                {user.vote ? ` ${user.vote} ` : '❌'}
                                            </div>
                                        }
                                    </div>
                                ))}
                            </div>

                            {
                                showVotes &&
                                <div className="planning-poker__average-container">
                                    Average: {avegare}
                                </div>
                            }
                        </div>

                        <div className="planning-poker__element-cards">
                            <div className="planning-poker__cards-title-container planning-poker__casino-text">
                                Your Vote:
                            </div>

                            <div className="planning-poker__cards-container">
                                {

                                    cards.map((card) => (
                                        <button
                                            key={card}
                                            onClick={() => handleVote(card)}
                                            className={`${selectedVote === card ? 'planning-poker__card--selected' : ''}`}
                                            style={{
                                                // backgroundColor: selectedVote === card ? 'rgba(44, 163, 179, 1)' : 'rgba(15, 23, 79, 1)',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                color: card == 1 || card == 5 || card == 13 ? '#c50303' : 'black'
                                            }}
                                        >
                                            {card}
                                            <div className="planning-poker__shine-card"></div>
                                            <img src={`../imgs/card-icons/${getIconByCard(card)}.webp`} className="planning-poker__top-icon" />
                                            <img src={`../imgs/card-icons/${getIconByCard(card)}.webp`} className="planning-poker__bottom-icon" />
                                        </button>
                                    ))}
                            </div>
                            {gameState.isAdmin && (
                                <div className="planning-poker__buttons-container">
                                    <button
                                        onClick={() => handleRevealVotes(true)}
                                        style={{
                                            marginTop: '1.5rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'green',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                        }}
                                    >
                                        Reveal cards
                                    </button>
                                    <button
                                        onClick={handleClearVotes}
                                        style={{
                                            marginTop: '1.5rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                        }}
                                    >
                                        Start new voting
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            }

        </div >
    );
};
