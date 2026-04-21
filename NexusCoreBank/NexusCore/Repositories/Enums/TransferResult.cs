namespace NexusCore.AccountRepositories
{
    public enum TransferResult
    {
        Success,
        TargetAccountNotFound,
        InsufficientFunds,
        CannotTransferToSelf,
        SystemError,

        // Below is Email Validation for OTP
        RequireOtp,
        InvalidOtp
    }
}