import React from 'react'
import styles from './styles.module.css';
import { useState, useEffect, useRef } from 'react';

const Message = ({socket}) => {
    
    const [messagesReceived, setMessagesReceived] = useState([]);

    const messagesColumnRef = useRef(null);

    // Runs whenever socked event received from server
    useEffect(() => {
        socket.on('receive_message', (data) => {
            // console.log(data);
            setMessagesReceived((state) => [
                ...state,
                {
                    message: data.message,
                    username: data.username,
                    _createdtime_: data._createdtime_,
                }
            ]);
        });
        // Remove eventlistener on component unmount
        return () => socket.off('receive_message');
    }, [socket]);

    useEffect(() => {
        // Last 100 messages sent in the chat room (fetched from the db in backend)
        socket.on('last_100_messages', (last100Messages) => {
        //   console.log('Last 100 messages:', JSON.parse(last100Messages));
          last100Messages = JSON.parse(last100Messages);
          // Sort these messages by _createdtime_
          last100Messages = sortMessagesByDate(last100Messages);
          setMessagesReceived((state) => [...last100Messages, ...state]);
        });
    
        return () => socket.off('last_100_messages');
      }, [socket]);

    // Scroll to the most recent message
    const scrollToBottom = () => {
        messagesColumnRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    useEffect(() => {
        scrollToBottom();
    }, [messagesReceived]);

    function sortMessagesByDate(messages) {
        return messages.sort(
          (a, b) => parseInt(a._createdtime_) - parseInt(b._createdtime_)
        );
      }

    // For date and time
    function formatDateFromTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    return (
       <div className={styles.messageColumn}>
        {messagesReceived.map((msg, i) => (
            <div className={styles.message} key={i}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span className={styles.msgMeta}>{msg.username}</span>
                    <span className={styles.msgMeta}>{formatDateFromTimestamp(msg._createdtime_)}</span>
                </div>
                <p className={styles.msgText}>{msg.message}</p>
                <br/>
            </div>
        ))}
        <div ref={messagesColumnRef} />
       </div>
    )
}

export default Message
