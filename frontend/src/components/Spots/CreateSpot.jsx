import SpotForm from './SpotForm'; 
import { useSelector } from 'react-redux';

const CreateSpot = () => {
    const currentUser = useSelector(state => state.session?.user); 

    if (currentUser) {
        const spot = {
            country: '',
            address: '',
            city: '',
            state: '',
            description: '',
            title: '',
            price: '',
            previewImage: '', 
            spotImages: []
        }
    
        return (
            <SpotForm 
            spot={spot}
            formType={"Create Spot"}
            />
        )
    }
}

export default CreateSpot;