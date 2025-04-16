"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getCodeforcesUser, getCodeforcesSubmissions } from "@/services/codeforces";
import { getLeetCodeUser, getLeetCodeSubmissions } from "@/services/leetcode";
import { getCodeChefUser, getCodeChefSubmissions } from "@/services/codechef";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeforcesUser, CodeforcesSubmission } from "@/services/codeforces";
import { LeetCodeUser, LeetCodeSubmission } from "@/services/leetcode";
import { CodeChefUser, CodeChefSubmission } from "@/services/codechef";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardProps {}

interface PlatformData<User, Submission> {
  handle: string;
  setHandle: React.Dispatch<React.SetStateAction<string>>;
  user: User | null;
  submissions: Submission[];
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  fetchUser: (username: string) => Promise<void>;
}

const usePlatform = <User, Submission>(
  getUser: (username: string) => Promise<User | null>,
  getSubmissions: (username: string, limit: number) => Promise<Submission[]>
): PlatformData<User, Submission> => {
  const [handle, setHandle] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const fetchUser = async (username: string) => {
    if (username) {
      const user = await getUser(username);
      const submissions = await getSubmissions(username, 100);
      setUser(user);
      setSubmissions(submissions);
    }
  };

  return {
    handle,
    setHandle,
    user,
    submissions,
    setUser,
    setSubmissions,
    fetchUser,
  };
};

const Dashboard: React.FC<DashboardProps> = ({}) => {
  const codeforcesPlatform = usePlatform<CodeforcesUser, CodeforcesSubmission>(
    getCodeforcesUser,
    getCodeforcesSubmissions
  );
  const leetcodePlatform = usePlatform<LeetCodeUser, LeetCodeSubmission>(
    getLeetCodeUser,
    getLeetCodeSubmissions
  );
  const codechefPlatform = usePlatform<CodeChefUser, CodeChefSubmission>(
    getCodeChefUser,
    getCodeChefSubmissions
  );

  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>("");

  const chartConfig = {
    codeforcesSubmissions: {
      label: "Codeforces Submissions",
      icon: Icons.file,
      color: "hsl(var(--chart-1))",
    },
    leetcodeSubmissions: {
      label: "LeetCode Submissions",
      icon: Icons.file,
      color: "hsl(var(--chart-2))",
    },
    codechefSubmissions: {
      label: "CodeChef Submissions",
      icon: Icons.file,
      color: "hsl(var(--chart-3))",
    },
  };

  const data = [
    {
      name: "Submissions",
      codeforcesSubmissions: codeforcesPlatform.submissions.length,
      leetcodeSubmissions: leetcodePlatform.submissions.length,
      codechefSubmissions: codechefPlatform.submissions.length,
    },
  ];

  const allSubmissions = [
    ...codeforcesPlatform.submissions.map(s => ({ ...s, platform: 'Codeforces' })),
    ...leetcodePlatform.submissions.map(s => ({ ...s, platform: 'LeetCode' })),
    ...codechefPlatform.submissions.map(s => ({ ...s, platform: 'CodeChef' })),
  ];

  const filteredSubmissions = submissionStatusFilter
    ? allSubmissions.filter(submission => submission.status === submissionStatusFilter)
    : allSubmissions;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlatformCard
          title="Codeforces"
          handle={codeforcesPlatform.handle}
          setHandle={codeforcesPlatform.setHandle}
          user={codeforcesPlatform.user}
          onSubmit={() => codeforcesPlatform.fetchUser(codeforcesPlatform.handle)}
        />
        <PlatformCard
          title="LeetCode"
          handle={leetcodePlatform.handle}
          setHandle={leetcodePlatform.setHandle}
          user={leetcodePlatform.user}
          onSubmit={() => leetcodePlatform.fetchUser(leetcodePlatform.handle)}
        />
        <PlatformCard
          title="CodeChef"
          handle={codechefPlatform.handle}
          setHandle={codechefPlatform.setHandle}
          user={codechefPlatform.user}
          onSubmit={() => codechefPlatform.fetchUser(codechefPlatform.handle)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="codeforcesSubmissions" fill="hsl(var(--chart-1))" />
              <Bar dataKey="leetcodeSubmissions" fill="hsl(var(--chart-2))" />
              <Bar dataKey="codechefSubmissions" fill="hsl(var(--chart-3))" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Recent Submissions</CardTitle>
          <Select onValueChange={setSubmissionStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="OK">OK</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="WRONG_ANSWER">Wrong Answer</SelectItem>
              <SelectItem value="TLE">Time Limit Exceeded</SelectItem>
              <SelectItem value="Compilation Error">Compilation Error</SelectItem>
              <SelectItem value="Runtime Error">Runtime Error</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Platform</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{submission.platform}</TableCell>
                    <TableCell>
                      {submission.problemName || submission.problemTitle || submission.problemCode}
                    </TableCell>
                    <TableCell>{submission.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

interface PlatformCardProps<User> {
  title: string;
  handle: string;
  setHandle: React.Dispatch<React.SetStateAction<string>>;
  user: User | null;
  onSubmit: () => void;
}

const PlatformCard = <User extends { username?: string; handle?: string; problemsSolved?: number }>({
  title,
  handle,
  setHandle,
  user,
  onSubmit,
}: PlatformCardProps<User>) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder={`${title} Username`}
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
          <Button onClick={onSubmit}>Fetch</Button>
        </div>
        {user && (
          <div className="mt-4">
            {user.username && <p>Username: {user.username}</p>}
            {user.handle && <p>Handle: {user.handle}</p>}
            {user.problemsSolved && <p>Problems Solved: {user.problemsSolved}</p>}
            {/* Add more user info here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard;
