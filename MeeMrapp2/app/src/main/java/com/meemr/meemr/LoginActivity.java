package com.meemr.meemr;

import android.support.v4.app.Fragment;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;

/**
 * Created by stefa on 27-6-2017.
 */

public class LoginActivity extends Fragment {
    EditText userInput;
    EditText passInput;
    TextView statusText;
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.content_login, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        Button button = (Button) view.findViewById(R.id.loginButton);
        button.setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                System.out.println("hallo");
                userInput=(EditText) getView().findViewById(R.id.userInput);
                passInput=(EditText) getView().findViewById(R.id.passInput);
                statusText=(TextView) getView().findViewById(R.id.statusText);
                try{
                    URL url = new URL("http://10.0.2.2:3000/user/login");
                    JSONObject jsonObject = new JSONObject();
                    jsonObject.accumulate("name", userInput.getText().toString());
                    jsonObject.accumulate("pass", passInput.getText().toString());
                    new JSONTask(url,jsonObject).execute();
                } catch (JSONException e){
                    e.printStackTrace();
                } catch (MalformedURLException e){
                    e.printStackTrace();
                }
            }
        });
    }

//    public void doLogin(View view){
//        userInput=(EditText) getView().findViewById(R.id.userInput);
//        passInput=(EditText) getView().findViewById(R.id.passInput);
//        statusText=(TextView) getView().findViewById(R.id.statusText);
//        new JSONTask(userInput.getText().toString(),passInput.getText().toString());
//    }
}
