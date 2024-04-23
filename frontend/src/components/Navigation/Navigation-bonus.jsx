import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';
// Todo: figure out absolute path imports
import BearBnbLogo from '../../../../images/BearBnb-Logo.png'; 


function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user); 

  return (
    <>
      <header>
        <NavLink to="/">
          <img className="bearbnb-logo" src={BearBnbLogo} alt="bear bnb logo"/>
        </NavLink>
          <div className="right-navigation">
            <div className="create-spot-button">
              {sessionUser && (
                <NavLink to="/spots">Create a New Spot</NavLink>
              )}
            </div>
            <div className="profile-button">
              {isLoaded && (
                  <ProfileButton user={sessionUser} />
              )}
            </div>
          </div>
      </header>
      <hr/>
    </>

  );
}

export default Navigation;
