namespace NexusCore.CustomerRepositories
{
    public enum CustomerSignUpResult
    {
        Success,
        EmailExists,
        PhoneNumberExists,
        SystemError
    }
}