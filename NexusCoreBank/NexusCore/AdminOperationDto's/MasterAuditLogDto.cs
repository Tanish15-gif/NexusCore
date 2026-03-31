namespace NexusCore.MasterAudiLogDto
{
    public class AuditLogResponse
    {
        public int LogId {get;set;}
        public string EmployeeName {get;set;} = "";
        public string ActionType {get;set;} = "";
        public string ActionDetails {get;set;} = "";
        public DateTime ActionDate {get;set;}
    }
}