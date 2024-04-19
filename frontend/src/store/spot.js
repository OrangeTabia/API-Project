const LOAD_SPOTS = 'spots/loadSpots'; 

export const loadSpots = (spots) => ({
    type: LOAD_SPOTS,
    spots
});  



const initialState = {}; 

function spotReducer(state = initialState, action) {
    switch (action.type) {

    }
}

export default spotReducer;