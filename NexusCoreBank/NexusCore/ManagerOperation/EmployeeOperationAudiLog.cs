using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using NexusCore.ListEmployeeActionDto;
namespace NexusCore.ManagerOperation
{
    public class ListEmployeeAuditLog
    {
        private readonly string? conn;
        public ListEmployeeAuditLog(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<AuditLogResponse> GetAuditLog()
        {
            List<AuditLogResponse> logResponses = new List<AuditLogResponse>();
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            select a.LogId,e.EmployeeName,a.ActionType,a.ActionDetails,a.ActionDate
                            from AuditLogs a
                            Join EmployeeProfiles e on a.EmployeeId = e.EmployeeId
                ";

                using (var cmd = new SqlCommand(sql,connect))
                {
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            logResponses.Add(new AuditLogResponse
                            {
                                LogId = (int)reader["LogId"],
                                EmployeeName = reader["EmployeeName"].ToString(),
                                ActionType = reader["ActionType"].ToString()!,
                                ActionDetails = reader["ActionDetails"].ToString()!,
                                ActionDate = Convert.ToDateTime(reader["ActionDate"]),
                            });
                        }
                    }
                }
            }
            return logResponses;
        }
    }
}