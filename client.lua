local QBCore = exports['qb-core']:GetCoreObject()
local isOpen = false

CreateThread(function()
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
    SendNUIMessage({ action = 'hide' })
    isOpen = false
end)

AddEventHandler('onResourceStart', function(res)
    if res == GetCurrentResourceName() then
        SetNuiFocus(false, false)
        SetNuiFocusKeepInput(false)
        SendNUIMessage({ action = 'hide' })
        isOpen = false
    end
end)

RegisterNetEvent('aliados_items:open', function()
    if isOpen then return end
    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open' })
    ExecuteCommand('e tablet2')

    QBCore.Functions.TriggerCallback('aliados_items:getItems', function(items)
        local list = {}
        for name, data in pairs(items or {}) do
            data.name = name
            list[#list+1] = data
        end
        table.sort(list, function(a,b)
            local la = tostring(a.label or a.name or '')
            local lb = tostring(b.label or b.name or '')
            return la:lower() < lb:lower()
        end)
        SendNUIMessage({ action = 'setItems', items = list })
    end)
end)

RegisterNUICallback('close', function(_, cb)
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
    SendNUIMessage({ action = 'hide' })
    isOpen = false
    ExecuteCommand('e c')
    cb('ok')
end)
