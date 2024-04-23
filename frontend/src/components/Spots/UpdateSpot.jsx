import SpotForm from './SpotForm'; 

const UpdateSpot = () => {
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
        formType={"Update Spot"}
        />
    )
}

export default UpdateSpot;