"use client";

import React from "react";
import { CharacterFrame } from "@/components/animations/CharacterFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingRow, SliderSetting, TimerInput } from "@/components/game/gameSettings";

export default function CreateRoomPage() {
  return (
    <main className="relative min-h-screen w-full bg-slate-950 pb-20">
      <CharacterFrame>
        <Card className="w-full bg-slate-900/60 border-slate-800 text-white backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-slate-800/50 pb-6">
            <CardTitle className="text-3xl font-black tracking-tighter text-center uppercase italic text-white">
              Create Lobby
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-950 border border-slate-800 p-1 mb-8">
                <TabsTrigger value="config" className="data-[state=active]:bg-indigo-600 text-slate-300">General</TabsTrigger>
                <TabsTrigger value="gameplay" className="data-[state=active]:bg-indigo-600 text-slate-300">Gameplay</TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-indigo-600 text-slate-300">Mechanics</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SliderSetting label="Max Players" min={3} max={20} step={1} defaultValue={10} />
                  
                  <div className="space-y-4">
                    <label className="text-slate-200 font-semibold uppercase tracking-wider text-xs">Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ro">Română</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <SettingRow label="Private Lobby" description="Only invited players can enter">
                  <Switch />
                </SettingRow>
              </TabsContent>

              <TabsContent value="gameplay" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SliderSetting label="Impostor Count" min={1} max={3} step={1} defaultValue={1} />
                  <SliderSetting label="Difficulty" min={1} max={5} step={1} defaultValue={3} />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-200 font-semibold uppercase tracking-wider text-xs">Word Category</label>
                  <Input placeholder="Search categories..." className="bg-slate-950 border-slate-700 text-white" />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <TimerInput label="Lobby" defaultValue={30} />
                  <TimerInput label="Discuss" defaultValue={90} />
                  <TimerInput label="Vote" defaultValue={30} />
                  <TimerInput label="Result" defaultValue={10} />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <SettingRow label="Anonymous Voting"><Switch /></SettingRow>
                  <SettingRow label="Hint System"><Switch defaultChecked /></SettingRow>
                  <SliderSetting label="Score Multiplier" min={1} max={5} step={0.1} defaultValue={1.5} suffix="x" />
                </div>
              </TabsContent>
            </Tabs>

            <Button className="w-full mt-10 py-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl tracking-widest uppercase shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all hover:scale-[1.01]">
              Initialize Room
            </Button>
          </CardContent>
        </Card>
      </CharacterFrame>
    </main>
  );
}