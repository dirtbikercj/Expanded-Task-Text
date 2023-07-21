using Aki.Reflection.Patching;
using Comfort.Common;
using EFT;
using EFT.UI;
using EFT.UI.Screens;
using HarmonyLib;
using System.Collections.Generic;
using System.Reflection;
using System.Security.Policy;
using UnityEngine;
using UnityEngine.Assertions.Must;

namespace ExpandedTaskText
{
    public class MenuTaskBarPatch : ModulePatch
    {
        protected override MethodBase GetTargetMethod() => typeof(MenuTaskBar).GetMethod("SetButtonsAvailable", BindingFlags.Public | BindingFlags.Instance);

        [PatchPostfix]
        static void PostFix(ref bool available)
        {
            MenuTaskBar _menuTaskBarInstance = MonoBehaviourSingleton<PreloaderUI>.Instance.MenuTaskBar;
            Dictionary<EMenuType, HoverTooltipArea> _hoverToolTipAreas = AccessTools.Field(typeof(MenuTaskBar), "_hoverTooltipAreas").GetValue(_menuTaskBarInstance) as Dictionary<EMenuType, HoverTooltipArea>;

            bool bool_0 = (bool)AccessTools.Field(typeof(MenuTaskBar), "bool_0").GetValue(_menuTaskBarInstance);

            AccessTools.Field(typeof(MenuTaskBar), "bool_1").SetValue(_menuTaskBarInstance, false);

            if (Singleton<GameWorld>.Instantiated)
            {
                foreach (KeyValuePair<EMenuType, HoverTooltipArea> keyValuePair in _hoverToolTipAreas)
                {
                    keyValuePair.Deconstruct(out EMenuType emenuType, out HoverTooltipArea hoverTooltipArea);
                    int num = (int)emenuType;

                    if (num == 5)
                    {
                        hoverTooltipArea.SetUnlockStatus(true);
                        hoverTooltipArea.SetMessageText(string.Empty, false);
                    }
                    else if (num != 6 && (num != 10 || bool_0))
                    {
                        hoverTooltipArea.SetUnlockStatus(available);
                        hoverTooltipArea.SetMessageText(available ? string.Empty : "Not available in raid", false);
                    }
                }
            }
            else
            {
                foreach (KeyValuePair<EMenuType, HoverTooltipArea> keyValuePair in _hoverToolTipAreas)
                {
                    keyValuePair.Deconstruct(out EMenuType emenuType, out HoverTooltipArea hoverTooltipArea);
                    int num = (int)emenuType;

                    ; if (num != 6 && (num != 10 || bool_0))
                    {
                        hoverTooltipArea.SetUnlockStatus(available);
                        hoverTooltipArea.SetMessageText(available ? string.Empty : "Not available in raid", false);
                    }
                }
            }
        }
    }

    public class OnScreenChangedPatch : ModulePatch
    {
        
        protected override MethodBase GetTargetMethod() => typeof(MenuTaskBar).GetMethod("OnScreenChanged", BindingFlags.Public | BindingFlags.Instance);

        [PatchPostfix]
        static void PostFix(ref EEftScreenType eftScreenType)
        {
            MenuTaskBar _menuTaskBarInstance = MonoBehaviourSingleton<PreloaderUI>.Instance.MenuTaskBar;
            Dictionary<EEftScreenType, EMenuType> _screenType = AccessTools.Field(typeof(MenuTaskBar), "dictionary_0").GetValue(_menuTaskBarInstance) as Dictionary<EEftScreenType, EMenuType>;
            Dictionary<EMenuType, HoverTooltipArea> _hoverToolTipAreas = AccessTools.Field(typeof(MenuTaskBar), "_hoverTooltipAreas").GetValue(_menuTaskBarInstance) as Dictionary<EMenuType, HoverTooltipArea>;
            bool bool_0 = (bool)AccessTools.Field(typeof(MenuTaskBar), "bool_0").GetValue(_menuTaskBarInstance);

            if (_screenType.TryGetValue(eftScreenType, out EMenuType _emenuType) && Singleton<GameWorld>.Instantiated)
            {
                if (_emenuType == EMenuType.Handbook) 
                {
                    foreach (KeyValuePair<EMenuType, HoverTooltipArea> keyValuePair in _hoverToolTipAreas)
                    {
                        keyValuePair.Deconstruct(out EMenuType emenuType, out HoverTooltipArea hoverTooltipArea);
                        int num = (int)emenuType;

                        if (num == 5)
                        {
                            hoverTooltipArea.SetUnlockStatus(true);
                            hoverTooltipArea.SetMessageText(string.Empty, false);
                        }
                        else if (num != 6 && (num != 10 || bool_0))
                        {
                            hoverTooltipArea.SetUnlockStatus(false);
                            hoverTooltipArea.SetMessageText("Not available in raid", false);
                        }
                    }
                }
            }
        }
    }
}