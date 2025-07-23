import { useEffect, useState } from 'react';
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
        const date = new Date();
        const sessionId = `${date.getFullYear()}${date.getDate() + 1}${date.getDay()}`;
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

    const getAvegareValue = () => {
        let points = 0;
        let playersNum = 0;
        for (const uuid in users) {
            if (users[uuid]?.vote && !isNaN(Number(users[uuid].vote))) {
                playersNum++;
                points += Number(users[uuid].vote);
            }
        }
        return playersNum == 0 ? 0 : points / playersNum;
    }

    const checkIfKickedOf = () => {
        let kickedOff = true;
        for (const uuid in users) {
            if (users[uuid]?.userId && users[uuid].userId == gameState.userId) {
                return false;
            }
        }
        return kickedOff;
    }

    useEffect(() => {
        if (gameState.userId) {
            const kickedOff = checkIfKickedOf();
            if (kickedOff) {
                setKickedOff(kickedOff);
            }
        }
    }, [Object.entries(users).length])

    const showVotes = showVotesAnyUser();
    const avegare = getAvegareValue();

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
                        You were kicked off from this room, please refresh
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
                        <h4>Room {gameState.sessionId}</h4>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div className="planning-poker__players-title-container">PLAYERS:</div>
                        <div className="planning-poker__players-container">
                            {Object.entries(users).map(([uid, user]) => (
                                <div className={`planning-poker__player ${gameState.name == user.name ? 'planning-poker__player--me' : ''}`} key={uid}>

                                    <div>
                                        {
                                            gameState.isAdmin &&
                                            <button className="planning-poker__delete-user-button" onClick={() => removeUser(user.userId)}><DeleteIcon /></button>
                                        }
                                        {
                                            user.isAdmin &&
                                            <span className="planning-poker__player-admin-label">
                                                Admin
                                            </span>
                                        }
                                        <span className="planning-poker__player-name" style={{ textTransform: 'capitalize' }}>
                                            {user.name}
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
                                        <div className="planning-poker__voting-status planning-poker__voting-status--show-votes">
                                            {user.vote ? `${user.vote}` : '❌'}
                                        </div>
                                    }
                                </div>
                            ))}
                        </div>

                    </div>


                    {
                        showVotes &&
                        <div className="planning-poker__average-container">
                            Average: {avegare}
                        </div>
                    }

                    <div>
                        <div className="planning-poker__cards-title-container">
                            Your Vote:
                        </div>

                        <div className="planning-poker__cards-container">
                            {cards.map((card) => (
                                <button
                                    key={card}
                                    onClick={() => handleVote(card)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: selectedVote === card ? 'rgba(44, 163, 179, 1)' : 'rgba(15, 23, 79, 1)',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {card}
                                </button>
                            ))}
                        </div>
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
                                Show votes
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
                                Clear Votes
                            </button>
                        </div>
                    )}
                </>
            }

        </div >
    );
};
