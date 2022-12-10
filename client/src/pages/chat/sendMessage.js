import React from 'react'
import styles from './styles.module.css';
import { useState } from 'react';

const SendMessage = ({socket, username, room}) => {
    const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (message !== '') {
        const _createdtime_ = Date.now();
        socket.emit('send_message', {username, room, message, _createdtime_});
        setMessage('');
    }
  };

  // const handleKeypress = (e) => {
  //   //it triggers by pressing the enter key
  //   if (e.keyCode === 13) {
  //     sendMessage();
  //   }
// };

  return (
    <div className={styles.sendMessageContainer}>
      
      <input
        className={styles.messageInput}
        placeholder='Message...'
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        // onKeyPress={handleKeypress}
      />
      <button type='submit' className='btn btn-primary' onClick={sendMessage}>
        Send 
      </button>
      
    </div>
  )
}

export default SendMessage
