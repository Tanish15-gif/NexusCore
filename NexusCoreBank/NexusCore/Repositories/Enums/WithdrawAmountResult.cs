namespace NexusCore.AccountRepositories
{
    public enum WithdrawAmountResult
    {
        Success,
        Failed,
        NotEnoughBalance,
        OverDraftLimitExceeds,
        ServerError
    }
}