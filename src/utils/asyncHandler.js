const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve( requestHandler(req, res, next))
        .catch( (err) => next(err))
    }
}


export { asyncHandler }



// bAsics
// const asyncHandler = () => {}

    // abb kuch function ko kisi aur function mai pass karna hoo..

// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

    // function aya , abb uss function ke upper ek function lga  diyaa
    // function mei se req,res aur next leke

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     }
//     catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }