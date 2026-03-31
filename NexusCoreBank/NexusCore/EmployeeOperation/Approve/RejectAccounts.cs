    using Microsoft.Data.SqlClient;
    using Microsoft.Extensions.Configuration;
    using NexusCore.ApprovalAccountDto;
    using NexusCore.ManagerOperation;

    namespace NexusCore.EmployeeOperation
    {
        public class Approval 
        {
            private readonly string? conn;
            public Approval(IConfiguration config)
            {
                conn = config.GetConnectionString("DefaultConnection");
            }
            public bool Approve(AccountApprove approve,int employeeid)
            {
                try
                {
                    using (var connect = new SqlConnection(conn))
                    {
                        connect.Open();
                        string sql = @"
                                    Update Accounts Set AccountStatus = 'Active'
                                    where AccountId = @aid and AccountStatus = 'Pending'";
                        using (var cmd = new SqlCommand(sql, connect))
                        {
                            cmd.Parameters.AddWithValue("@aid", approve.Accountid);
                            int rows = cmd.ExecuteNonQuery();
                            if (rows > 0)
                            {
                                RecordEmployeeAction(employeeid, "Approved", $"Approved Customer Account ID: {approve.Accountid}");
                                return true;
                            }
                        }
                    }
                    return false;
                }
                catch (SqlException ex)
                {
                    Console.WriteLine(ex.Message);
                    return false;
                }
            }
            public bool Reject(AccountApprove account,int employeeid)
            {
                try
                {
                    using (var connect = new SqlConnection(conn))
                    {
                        connect.Open();
                        string sql = @"
                                    Update Accounts
                                    Set AccountStatus = 'Rejected' where AccountId = @aid and AccountStatus = 'Pending';
                                    ";
                        using(var cmd = new SqlCommand(sql,connect))
                        {
                            cmd.Parameters.AddWithValue("@aid",account.Accountid);
                            int rows = cmd.ExecuteNonQuery();
                            if(rows > 0)
                            {
                                RecordEmployeeAction(employeeid, "Rejected", $"Rejected Customer Account ID: {account.Accountid}");
                                return true;
                            }
                        }
                    }
                    return false;
                }
                catch (SqlException ex)
                {
                    Console.WriteLine(ex.Message);
                    return false;
                }
            }
            public void RecordEmployeeAction(int employeeid,string ActionType,string ActionDetails)
            {
                using(var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = @"
                                Insert into AuditLogs(EmployeeId,ActionType,ActionDetails)
                                Values(@empid,@acctype,@tid);
                    ";
                    using(var cmd = new SqlCommand(sql,connect))
                    {
                        cmd.Parameters.AddWithValue("@empid",employeeid);
                        cmd.Parameters.AddWithValue("@acctype",ActionType);
                        cmd.Parameters.AddWithValue("@tid",ActionDetails);
                        
                        cmd.ExecuteNonQuery();
                    }
                }
            }
        }
    }