/** Action Type Constants: */
const LOAD_SPOTS = 'spots/loadSpots'; 
const RECEIVE_SPOT = 'spots/receiveSpot'; 

/**  Action Creators: */
export const loadSpots = (spots) => ({
    type: LOAD_SPOTS,
    spots
});  

export const receiveSpot = (spot) => ({
    type: RECEIVE_SPOT,
    spot
});


/** Thunk Action Creators: */
export const fetchSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots'); 
    const spots = await response.json(); 
    dispatch(loadSpots(spots)); 
 }

export const fetchSpotDetails = (spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}`); 
    const spotDetails = await response.json(); 
    dispatch(receiveSpot(spotDetails)); 
}

/** Reducer: */
const initialState = {}; 

function spotReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_SPOTS: {
            return {...state, ...action.spots}
        }
        case RECEIVE_SPOT: {
            return {...state, ...action.spot}
        }

        default:
            return state;
    }
}

export default spotReducer;


/*

    {
        user: {
            name: 'Jeramie',
            password: 'Not my pass',
        },
        Spots: { 
            Spots: [
                {},
            ]
        },
        Reviews: [
            {}
        ]
    }

*/