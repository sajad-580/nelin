const ErrorComponent = ({ isError, message }) => {
  {
    return (
      isError && (
        <div className="alert alert-danger">
          {message}
        </div>
      )
    )
  }
}

export default ErrorComponent
