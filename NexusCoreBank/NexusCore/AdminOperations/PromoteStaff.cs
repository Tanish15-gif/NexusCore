using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.PromotionDto;

namespace NexusCore.AdminOperation
{
    public class PromoteUser
    {
        private readonly string? conn;
        public PromoteUser(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public bool Promote(Promotion promotion)
        {
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = "Update Users Set Role = @role where UserId = @userid";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@userid",promotion.UserId);
                    cmd.Parameters.AddWithValue("@role",promotion.NewRole);
                    int rows = cmd.ExecuteNonQuery();

                    if(rows > 0) 
                    {    
                        string insertsql = @"Insert into AuditLogs(EmployeeId,ActionType,ActionDetails)
                                            Values(@eid,@actype,@actdetails);
                        ";
                        using(var insertcmd = new SqlCommand(insertsql,connect))
                        {
                            insertcmd.Parameters.AddWithValue("@eid",1);
                            insertcmd.Parameters.AddWithValue("@actype","Promoted");
                            insertcmd.Parameters.AddWithValue("@actdetails",$"Promoted Staff Id: {promotion.UserId} to {promotion.NewRole}");
                            insertcmd.ExecuteNonQuery();
                            return true;
                        }
                    }
                    else return false;
                }
            }
        }
    }
}