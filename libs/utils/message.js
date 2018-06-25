const sendError = (res, error) => {
    return res
        .status(400)
        .send({
            success: false,
            error: JSON.parse(error)
        });
};

export default { sendError };