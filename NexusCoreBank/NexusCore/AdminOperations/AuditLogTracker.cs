using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using NexusCore.MasterAudiLogDto;

namespace NexusCore.AdminOperation
{
    public class MasterAudiLog
    {
        private readonly string? conn;
        public MasterAudiLog(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<AuditLogResponse> AuditLogTracker()
        {
            List<AuditLogResponse> logResponses = new List<AuditLogResponse>();
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            Select 
                            a.LogId, 
                            e.EmployeeName,
                            a.ActionType,
                            a.ActionDetails,
                            a.ActionDate
                            from AuditLogs a
                            Join EmployeeProfiles e on a.EmployeeId = e.EmployeeId
                            Order By a.ActionDate DESC;
                ";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    using(var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            logResponses.Add(new AuditLogResponse
                            {
                                LogId = (int)reader["LogId"],
                                EmployeeName = reader["EmployeeName"].ToString()!,
                                ActionType = reader["ActionType"].ToString()!,
                                ActionDetails = reader["ActionDetails"].ToString()!,
                                ActionDate = Convert.ToDateTime(reader["ActionDate"])
                            });
                        }
                    }
                }
            }
            return logResponses;
        }
    }
}