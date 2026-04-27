namespace NexusCore.OpenAccountsDto
{
    public class OpenAccount
    {
        public string AccountType {get;set;} = "";
        public decimal InitialDeposit {get;set;}
        public string SourceofFunds {get;set;} = "";
        public string NomineeName  {get;set;} = "";
        public string NomineeRelationship {get;set;} = "";
        public int? TermDuration {get;set;}
    }
}