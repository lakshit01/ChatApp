import React from 'react'
import styles from './styles.module.css';
import Messages from './message'
import SendMessage from './sendMessage';
import UserAndRoom from './user&room';

const Chat = ({username, room, socket}) => {
  return (
    <div className={styles.chatContainer}>
        <UserAndRoom socket={socket} username={username} room={room} />
      <div className={styles.msgAndInput}>
        <Messages socket={socket} />
        <SendMessage socket={socket} username={username} room={room} />
      </div>
    </div>
  )
}

export default Chat
