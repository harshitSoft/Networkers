function Person({side}){return <div className={`network-person ${side}`}><b className="person-head"><i/><i/></b><b className="person-body"/><b className="person-arm back"/><b className="person-arm handshake"/><b className="person-leg back"/><b className="person-leg front"/></div>}

export default function Loader({label="Connecting Networkers",fullScreen=false}){
  const content=<div className="networkers-loader" role="status" aria-live="polite" aria-label={label}><div className="handshake-brand">Network<span>ers</span></div><div className="handshake-stage" aria-hidden="true"><div className="handshake-ground"/><Person side="left"/><Person side="right"/><div className="handshake-glow">✦</div></div><p>{label}<span className="loader-dots"/></p></div>;
  return fullScreen?<div className="networkers-loader-screen">{content}</div>:null;
}
