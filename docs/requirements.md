% Button pushed function: ResetButton
function ResetButtonPushed(app, event)
    % Reset inputs
    app.PowerEditField.Value = 0;
    app.VoltageEditField.Value = 0;
    app.LengthEditField.Value = 0;
    app.PFDropDown.Value = '0.85';
    
    % Reset outputs
    app.CurrentOutputField.Value = 0;
    app.CableAreaOutputField.Value = 0;
    app.VoltDropOutputField.Value = 0;
    
    % Clear graph
    cla(app.UIAxes);
end
