const AuthCard = ({ title, children, bottomText }) => {
  return (
    <div className="auth-card">
      <h2>{title}</h2>
      {children}
      <div className="link">{bottomText}</div>
    </div>
  );
};

export default AuthCard;
