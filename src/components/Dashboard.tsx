"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getCodeforcesUser, getCodeforcesSubmissions } from "@/services/codeforces";
import { getLeetCodeUser, getLeetCodeSubmissions } from "@/services/leetcode";
import { getHackerRankUser, getHackerRankSubmissions } from "@/services/hackerrank";
import {
  Table,
  TableBody,
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
import { Search, User, FileCode, BarChart2, PieChart as PieChartIcon, LineChart, AlertCircle } from "lucide-react";
import _ from 'lodash';

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
  const [ratingHistory, setRatingHistory] = useState<{ rating: number; timestamp: number }[]>([]);

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

  // Professional color palette
  const COLORS = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585'];

  const chartConfig = {
    codeforcesSubmissions: {
      label: "Codeforces",
      icon: Icons.file,
      color: "#4361ee",
    },
    leetcodeSubmissions: {
      label: "LeetCode",
      icon: Icons.file,
      color: "#3a0ca3",
    },
    hackerrankSubmissions: {
      label: "HackerRank",
      icon: Icons.file,
      color: "#7209b7",
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

  const getStatusBadgeColor = (status: string): string => {
    const normalizedStatus = statusMapping[status] || status;
    switch(normalizedStatus) {
      case 'OK':
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'Wrong Answer':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Time Limit Exceeded':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'Compilation Error':
      case 'Runtime Error':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
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

  const submissionsByStatus = filteredSubmissions.reduce((acc: {[key: string]: number}, submission) => {
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

    // Difficulty distribution for Codeforces
    const codeforcesDifficultyData = codeforcesPlatform.submissions.reduce((acc: { [key: string]: number }, submission) => {
      // Assuming there's a way to determine difficulty, replace with actual logic
      const difficulty = '800'; // Replace with actual difficulty from submission or problem
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {});

    const difficultyData = Object.keys(codeforcesDifficultyData).map(difficulty => ({
      name: difficulty,
      value: codeforcesDifficultyData[difficulty]
    }));

    // Language distribution for Codeforces
    const codeforcesLanguageData = codeforcesPlatform.submissions.reduce((acc: { [key: string]: number }, submission) => {
      // Assuming there's a way to determine language, replace with actual logic
      const language = 'cpp'; // Replace with actual language from submission
      acc[language] = (acc[language] || 0) + 1;
      return acc;
    }, {});

    const languageData = Object.keys(codeforcesLanguageData).map(language => ({
      name: language,
      value: codeforcesLanguageData[language]
    }));


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Competitive Programming Analytics</h1>
        <p className="text-muted-foreground">Monitor your performance across multiple coding platforms</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlatformCard
          title="Codeforces"
          icon={<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><span className="text-blue-600 font-bold">CF</span></div>}
          handle={codeforcesPlatform.handle}
          setHandle={codeforcesPlatform.setHandle}
          user={codeforcesPlatform.user}
          onSubmit={() => codeforcesPlatform.fetchUser(codeforcesPlatform.handle)}
          color="border-blue-200"
        />
        <PlatformCard
          title="LeetCode"
          icon={<div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center"><span className="text-yellow-600 font-bold">LC</span></div>}
          handle={leetcodePlatform.handle}
          setHandle={leetcodePlatform.setHandle}
          user={leetcodePlatform.user}
          onSubmit={() => leetcodePlatform.fetchUser(leetcodePlatform.handle)}
          color="border-yellow-200"
        />
        <PlatformCard
          title="HackerRank"
          icon={<div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><span className="text-green-600 font-bold">HR</span></div>}
          handle={hackerrankPlatform.handle}
          setHandle={hackerrankPlatform.setHandle}
          user={hackerrankPlatform.user}
          onSubmit={() => hackerrankPlatform.fetchUser(hackerrankPlatform.handle)}
          color="border-green-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-indigo-500" />
              <CardTitle>Submissions Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Legend />
                <Bar dataKey="codeforcesSubmissions" name={chartConfig.codeforcesSubmissions.label} fill={chartConfig.codeforcesSubmissions.color} radius={[4, 4, 0, 0]} />
                <Bar dataKey="leetcodeSubmissions" name={chartConfig.leetcodeSubmissions.label} fill={chartConfig.leetcodeSubmissions.color} radius={[4, 4, 0, 0]} />
                <Bar dataKey="hackerrankSubmissions" name={chartConfig.hackerrankSubmissions.label} fill={chartConfig.hackerrankSubmissions.color} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-indigo-500" />
              <CardTitle>Submissions by Platform</CardTitle>
            </div>
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
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {codeforcesPlatform.ratingHistory.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5 text-indigo-500"/>
                  <CardTitle>Codeforces Rating Progression</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={codeforcesPlatform.ratingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}
                      tick={{fill: '#6b7280'}}
                    />
                    <YAxis tick={{fill: '#6b7280'}}/>
                    <Tooltip
                      labelFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#4361ee"
                      strokeWidth={2}
                      dot={{fill: '#4361ee', strokeWidth: 2}}
                      activeDot={{r: 6, fill: '#4361ee'}}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-5 w-5 text-indigo-500"/>
                <CardTitle>Submissions by Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="name" tick={{fill: '#6b7280'}}/>
                  <YAxis tick={{fill: '#6b7280'}}/>
                  <Tooltip
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}}/>
                  <Legend/>
                  <Bar dataKey="value" name="Submissions" fill="#4361ee" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-5 w-5 text-indigo-500"/>
                <CardTitle>Codeforces Difficulty Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="name" tick={{fill: '#6b7280'}}/>
                  <YAxis tick={{fill: '#6b7280'}}/>
                  <Tooltip
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}}/>
                  <Legend/>
                  <Bar dataKey="value" name="Difficulty" fill="#82ca9d" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5 text-indigo-500"/>
                <CardTitle>Codeforces Language Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {
                      languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                      ))
                    }
                  </Pie>
                  <Tooltip
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="h-5 w-5 text-indigo-500" />
              <CardTitle>Recent Submissions</CardTitle>
            </div>
            <Select onValueChange={(value) => setSubmissionStatusFilter(value === "" ? null : value)}>
              <SelectTrigger className="w-[180px] border-slate-200">
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[150px]">Platform</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead className="w-[150px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission: any, index: number) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {submission.platform === 'Codeforces' && (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">CF</span>
                            </div>
                          )}
                          {submission.platform === 'LeetCode' && (
                            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                              <span className="text-yellow-600 text-xs font-bold">LC</span>
                            </div>
                          )}
                          {submission.platform === 'HackerRank' && (
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 text-xs font-bold">HR</span>
                            </div>
                          )}
                          <span>{submission.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.problemName || submission.problemTitle || submission.problemCode}
                      </TableCell>
                      <TableCell>
                        <Badge className={`font-medium ${getStatusBadgeColor(submission.status)}`}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-slate-300" />
                        <p>No submissions found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
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
  icon?: React.ReactNode;
  handle: string;
  setHandle: React.Dispatch<React.SetStateAction<string>>;
  user: User | null;
  onSubmit: () => void;
  color?: string;
}

const PlatformCard = <User extends { username?: string; handle?: string; problemsSolved?: number }>({
  title,
  icon,
  handle,
  setHandle,
  user,
  onSubmit,
  color,
}: PlatformCardProps<User>) => {
  return (
    <Card className={`shadow-sm ${color ? `border-l-4 ${color}` : ''}`}>
      <CardHeader className="pb-0">
        <div className="flex items-center space-x-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={`${title} Username`}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>
            <Button 
              onClick={onSubmit}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Fetch
            </Button>
          </div>
          
          {title === "LeetCode" && user === null && handle !== "" ? (
             <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Profile Information</h3>
              </div>
              <Separator />
              <div className="space-y-1.5 pt-1">
                   <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Profile not found</span>
                    </div>
              </div>
            </div>
          ) : (user && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold">Profile Information</h3>
              </div>
              <Separator />
              <div className="space-y-1.5 pt-1">
                {user.username && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Username:</span>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                )}
                {user.handle && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Handle:</span>
                    <span className="text-sm font-medium">{user.handle}</span>
                  </div>
                )}
                {user.problemsSolved && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Problems Solved:</span>
                    <span className="text-sm font-medium">{user.problemsSolved}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
