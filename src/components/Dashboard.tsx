"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getCodeforcesUser, getCodeforcesSubmissions } from "@/services/codeforces";
import { getLeetCodeUser, getLeetCodeSubmissions } from "@/services/leetcode";
import { getHackerRankUser, getHackerRankSubmissions } from "@/services/hackerrank";
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
import { HackerRankUser, HackerRankSubmission } from "@/services/hackerrank";
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
    PieChart,
    Pie,
    Cell,
    BarChart
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
  ratingHistory: { rating: number; timestamp: number }[];
}

const usePlatform = <User, Submission>(
  getUser: (username: string) => Promise<User | null>,
  getSubmissions: (username: string, limit: number) => Promise<Submission[]>,
  getRatingHistory?: (username: string) => Promise<{ rating: number; timestamp: number }[]>
): PlatformData<User, Submission> => {
  const [handle, setHandle] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [ratingHistory, setRatingHistory] = useState<{ rating: number; timestamp: number }[]>([])

  const fetchUser = async (username: string) => {
    if (username) {
      const user = await getUser(username);
      const submissions = await getSubmissions(username, 100);
      setUser(user);
      setSubmissions(submissions);
        if (getRatingHistory) {
            const history = await getRatingHistory(username);
            setRatingHistory(history);
        }
    }
  };

  return {
    handle,
    setHandle,
    user,
    submissions,
    setUser,
    setSubmissions,
      ratingHistory,
    fetchUser,
  };
};

const Dashboard: React.FC<DashboardProps> = ({}) => {
  const codeforcesPlatform = usePlatform<CodeforcesUser, CodeforcesSubmission>(
    getCodeforcesUser,
    getCodeforcesSubmissions,
      async (handle: string) => {
          try {
              const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
              if (!response.ok) {
                  console.error("Failed to fetch Codeforces rating history:", response.status);
                  return [];
              }
              const data = await response.json();
              if (data.status !== 'OK' || !data.result) {
                  return [];
              }
              return data.result.map((ratingChange: any) => ({
                  rating: ratingChange.newRating,
                  timestamp: ratingChange.ratingUpdateTimeSeconds,
              }));
          } catch (error) {
              console.error("Failed to fetch Codeforces rating history:", error);
              return [];
          }
      }
  );
  const leetcodePlatform = usePlatform<LeetCodeUser, LeetCodeSubmission>(
    getLeetCodeUser,
    getLeetCodeSubmissions
  );
  const hackerrankPlatform = usePlatform<HackerRankUser, HackerRankSubmission>(
    getHackerRankUser,
    getHackerRankSubmissions
  );

  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string | null>(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
    hackerrankSubmissions: {
      label: "HackerRank Submissions",
      icon: Icons.file,
      color: "hsl(var(--chart-3))",
    },
  };

  const allSubmissions = [
    ...codeforcesPlatform.submissions.map(s => ({ ...s, platform: 'Codeforces', status: s.status ?? 'OK' })),
    ...leetcodePlatform.submissions.map(s => ({ ...s, platform: 'LeetCode', status: s.status ?? 'Accepted' })),
    ...hackerrankPlatform.submissions.map(s => ({ ...s, platform: 'HackerRank', status: s.status ?? 'Accepted' })),
  ];

    const statusMapping: { [key: string]: string } = {
        OK: 'OK',
        ACCEPTED: 'Accepted',
        WRONG_ANSWER: 'Wrong Answer',
        TLE: 'Time Limit Exceeded',
        'Compilation Error': 'Compilation Error',
        'Runtime Error': 'Runtime Error',
        Accepted: 'Accepted'
    };

  const filteredSubmissions = submissionStatusFilter
    ? allSubmissions.filter(submission => {
      const normalizedStatus = statusMapping[submission.status] || submission.status;
      return normalizedStatus === submissionStatusFilter
    })
    : allSubmissions;

  const filteredCodeforcesSubmissions = submissionStatusFilter
    ? codeforcesPlatform.submissions.filter(submission => {
      const normalizedStatus = statusMapping[submission.status] || submission.status;
      return normalizedStatus === submissionStatusFilter;
    }).length
    : codeforcesPlatform.submissions.length;

  const filteredLeetcodeSubmissions = submissionStatusFilter
    ? leetcodePlatform.submissions.filter(submission => {
      const normalizedStatus = statusMapping[submission.status] || submission.status;
      return normalizedStatus === submissionStatusFilter
    }).length
    : leetcodePlatform.submissions.length;

  const filteredHackerrankSubmissions = submissionStatusFilter
    ? hackerrankPlatform.submissions.filter(submission => {
      const normalizedStatus = statusMapping[submission.status] || submission.status;
      return normalizedStatus === submissionStatusFilter
    }).length
    : hackerrankPlatform.submissions.length;

    const submissionsByStatus = filteredSubmissions.reduce((acc, submission) => {
        const status = submission.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusData = Object.keys(submissionsByStatus).map(status => ({
        name: status,
        value: submissionsByStatus[status]
    }));

    const submissionsByPlatform = {
        Codeforces: filteredCodeforcesSubmissions,
        LeetCode: filteredLeetcodeSubmissions,
        HackerRank: filteredHackerrankSubmissions,
    };

    const platformData = Object.keys(submissionsByPlatform).map(platform => ({
        name: platform,
        value: submissionsByPlatform[platform]
    }));

  const data = [
    {
      name: "Submissions",
      codeforcesSubmissions: filteredCodeforcesSubmissions,
      leetcodeSubmissions: filteredLeetcodeSubmissions,
      hackerrankSubmissions: filteredHackerrankSubmissions,
    },
  ];

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
          title="HackerRank"
          handle={hackerrankPlatform.handle}
          setHandle={hackerrankPlatform.setHandle}
          user={hackerrankPlatform.user}
          onSubmit={() => hackerrankPlatform.fetchUser(hackerrankPlatform.handle)}
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
              <Bar dataKey="hackerrankSubmissions" fill="hsl(var(--chart-3))" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

        {codeforcesPlatform.ratingHistory.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Codeforces Rating History</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={codeforcesPlatform.ratingHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()} />
                            <YAxis />
                            <Tooltip labelFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}/>
                            <Line type="monotone" dataKey="rating" stroke="hsl(var(--chart-1))" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Submissions by Status</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="hsl(var(--accent))" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Submissions by Platform</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={platformData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label
                        >
                            {
                                platformData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))
                            }
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Recent Submissions</CardTitle>
          <Select onValueChange={(value) => setSubmissionStatusFilter(value === "" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={""}>All Statuses</SelectItem>
              <SelectItem value={"OK"}>OK</SelectItem>
              <SelectItem value={"Accepted"}>Accepted</SelectItem>
              <SelectItem value={"Wrong Answer"}>Wrong Answer</SelectItem>
              <SelectItem value={"Time Limit Exceeded"}>Time Limit Exceeded</SelectItem>
              <SelectItem value={"Compilation Error"}>Compilation Error</SelectItem>
              <SelectItem value={"Runtime Error"}>Runtime Error</SelectItem>
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
