// usePlanningPoker.js
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
    ref,
    onValue,
    set,
    update,
    remove,
    // onDisconnect
} from 'firebase/database';

export function usePlanningPoker(gameState) {
    const [users, setUsers] = useState({});

    const sessionUsersRef = ref(db, `sessions/${gameState.sessionId}/users`);

    useEffect(() => {
        if (gameState.sessionId) {
            const unsubscribe = onValue(sessionUsersRef, (snapshot) => {
                setUsers(snapshot.val() || {});
            });

            joinSession();

            return () => unsubscribe();
        }
    }, [gameState.sessionId]);

    const joinSession = () => {
        return set(ref(db, `sessions/${gameState.sessionId}/users/${gameState.userId}`), {
            name: gameState.name,
            isAdmin: gameState.isAdmin,
            vote: gameState.vote,
            userId: gameState.userId
        });
    };

    const vote = (value) => {
        return update(ref(db, `sessions/${gameState.sessionId}/users/${gameState.userId}`), {
            vote: value,
        });
    };

    const revealVotesForEveryone = (value) => {
        return update(ref(db, `sessions/${gameState.sessionId}/users/${gameState.userId}`), {
            revealVotes: value,
        });
    };

    const clearVotes = async () => {
        const updates = {};
        Object.keys(users).forEach((uid) => {
            updates[`sessions/${gameState.sessionId}/users/${uid}/vote`] = null;
        });
        return update(ref(db), updates);
    };

    const removeUser = (userId) => {
        return remove(ref(db, `sessions/${gameState.sessionId}/users/${userId}`));
    };

    // onDisconnect(ref(db, `sessions/${gameState?.sessionId}/users/${gameState?.userId}`)).remove();

    return {
        users,
        vote,
        clearVotes,
        removeUser,
        revealVotesForEveryone
    };
}
