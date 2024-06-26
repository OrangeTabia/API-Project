import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import { NavLink, useNavigate } from 'react-router-dom'; 
import './ProfileButton.css';  
import BearBnbLogin from '../../../../images/bearbnb-login-button.png';


function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const navigate = useNavigate(); 

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    navigate('/');
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <div className="dropdown-div">
      <button className="background-modal" onClick={toggleMenu}>
        <img src={BearBnbLogin} alt="bear modal button"/>
      </button>
      <div className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <p className="email-greeting">{`Hello, ${user.firstName}`}<br></br>{user.email}</p>
            <hr className="user-info-line"></hr>
            <NavLink to="/spots/current">
              <button className="manage-spots-button">Manage Spots</button>
            </NavLink>
            <hr className="user-info-line"></hr>
            <button className="logout-button" onClick={logout}>Log Out</button>
          </>
          
        ) : (
          <>
            <OpenModalMenuItem
              itemText="Log In"
              onItemClick={closeMenu}
              modalComponent={<LoginFormModal />}
            />
            <OpenModalMenuItem
              itemText="Sign Up"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileButton;
