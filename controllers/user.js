export const getcurrentUser = async (req,res) => {
    try {
        if(!req.userId){
            return res.json({user:null})
        }
         return res.json(req.userId)
    } catch (error) {
        return res.status(500).json({message :`get current user error ${error}`})
    }
}