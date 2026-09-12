// RlonDSP
// Copyright © 2026 RlonDSP. All rights reserved.
// Based on Echomusic open-source project, modified and extended for RlonDSP.
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;

class IconPatcher
{
    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    static extern IntPtr BeginUpdateResource(string pFileName, bool bDeleteExistingResources);

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    static extern bool UpdateResource(IntPtr hUpdate, IntPtr lpType, IntPtr lpName, ushort wLanguage, byte[] lpData, uint cbData);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool EndUpdateResource(IntPtr hUpdate, bool fDiscard);

    static IntPtr MakeId(int value)
    {
        return (IntPtr)value;
    }

    static void Main(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("usage: IconPatcher <exe> <icon.ico>");
            Environment.Exit(1);
        }

        var ico = File.ReadAllBytes(args[1]);
        var entries = ParseIco(ico);
        var group = new List<byte>();
        group.AddRange(new byte[] { 0, 0, 1, 0, (byte)entries.Count, 0 });

        var hUpdate = BeginUpdateResource(args[0], false);
        if (hUpdate == IntPtr.Zero)
        {
            throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        }

        try
        {
            for (int i = 0; i < entries.Count; i++)
            {
                var entry = entries[i];
                var iconData = new byte[(int)entry.Size];
                Array.Copy(ico, entry.Offset, iconData, 0, (int)entry.Size);
                if (!UpdateResource(hUpdate, MakeId(3), MakeId(i + 1), 0, iconData, (uint)iconData.Length))
                    throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());

                group.Add(entry.Width);
                group.Add(entry.Height);
                group.Add(entry.ColorCount);
                group.Add(entry.Reserved);
                group.AddRange(BitConverter.GetBytes(entry.Planes));
                group.AddRange(BitConverter.GetBytes(entry.BitCount));
                group.AddRange(BitConverter.GetBytes(entry.Size));
                group.AddRange(BitConverter.GetBytes((ushort)(i + 1)));
            }

            if (!UpdateResource(hUpdate, MakeId(14), MakeId(1), 0, group.ToArray(), (uint)group.Count))
                throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());

            if (!EndUpdateResource(hUpdate, false))
                throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        }
        catch
        {
            EndUpdateResource(hUpdate, true);
            throw;
        }

        Console.WriteLine("icon patched");
    }

    class IcoEntry
    {
        public byte Width;
        public byte Height;
        public byte ColorCount;
        public byte Reserved;
        public ushort Planes;
        public ushort BitCount;
        public uint Size;
        public uint Offset;
    }

    static List<IcoEntry> ParseIco(byte[] data)
    {
        if (data.Length < 6 || data[0] != 0 || data[1] != 0 || data[2] != 1 || data[3] != 0)
            throw new Exception("invalid ico");
        int count = data[4] | (data[5] << 8);
        var list = new List<IcoEntry>();
        for (int i = 0; i < count; i++)
        {
            int p = 6 + i * 16;
            var entry = new IcoEntry
            {
                Width = data[p],
                Height = data[p + 1],
                ColorCount = data[p + 2],
                Reserved = data[p + 3],
                Planes = BitConverter.ToUInt16(data, p + 4),
                BitCount = BitConverter.ToUInt16(data, p + 6),
                Size = BitConverter.ToUInt32(data, p + 8),
                Offset = BitConverter.ToUInt32(data, p + 12)
            };
            list.Add(entry);
        }
        return list;
    }
}
