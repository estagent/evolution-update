export default err => {
  if (err.response && err.response.data) {
    return (
      err.response.data.error ||
      err.response.data.message ||
      err.response.data
    )
  } else {
    return err.response ? err.response.statusText : err.message ?? err
  }
}

