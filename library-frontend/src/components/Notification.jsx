const Notification = (props) => {
    const { message } = props;
    if (!message) return null;
    const style = {
        padding: '1.5rem 1rem',
        color: 'firebrick',
        border: '3px solid',
        borderRadius: '0.5rem',
    };
    return <div style={style}>{message}</div>;
};

export default Notification;
