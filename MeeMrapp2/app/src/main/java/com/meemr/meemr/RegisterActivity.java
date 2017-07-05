package com.meemr.meemr;

import android.app.Activity;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.design.widget.NavigationView;
import android.support.design.widget.Snackbar;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.sql.SQLOutput;
import java.util.HashMap;

/**
 * Created by stefa on 27-6-2017.
 */

public class RegisterActivity extends Fragment {
    String token = "";
    EditText userInput;
    EditText passInput;
    EditText confirmInput;
    TextView navheader;
    TextView statusText;
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.content_register, container, false);
    }

    public void hideIM(){
        InputMethodManager inputMethodManager = (InputMethodManager) getActivity().getSystemService(Activity.INPUT_METHOD_SERVICE);
        inputMethodManager.hideSoftInputFromWindow(getActivity().getCurrentFocus().getWindowToken(), 0);
    }
    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        Button button = (Button) view.findViewById(R.id.registerButton);
        button.setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                System.out.println("hallo daar");
                userInput=(EditText) getView().findViewById(R.id.userInput);
                passInput=(EditText) getView().findViewById(R.id.passInput);
                confirmInput=(EditText) getView().findViewById(R.id.confirmInput);
                System.out.println("MEEMRINFO: GEKLIKT OP HET REGISTER KNOPPIE");
                System.out.println(passInput.getText().toString());
                System.out.println(confirmInput.getText().toString());
                if(passInput.getText().toString().equals(confirmInput.getText().toString())) {

                    System.out.println("MEEMRINFO: PASSWORD MATCH");
                    RequestQueue requestQueue = Volley.newRequestQueue(getActivity());
                    final String URL = "http://10.0.2.2:3000/user/create";
                    // Post params to be sent to the server
                    HashMap<String, String> params = new HashMap<String, String>();
                    params.put("name", userInput.getText().toString());
                    params.put("pass", passInput.getText().toString());

                    JsonObjectRequest req = new JsonObjectRequest(URL, new JSONObject(params),
                            new Response.Listener<JSONObject>() {
                                @Override
                                public void onResponse(JSONObject response) {
                                    try {
                                        VolleyLog.v("Response:%n %s", response.toString(4));
                                        token = response.getString("token");
                                        System.out.println(token);
                                        Snackbar.make(getView().findViewById(R.id.passInput), "Account created!", Snackbar.LENGTH_LONG)
                                                .setAction("Action", null).show();
                                        ((MainActivity) getActivity()).setToken(token);
                                        ((MainActivity) getActivity()).setLoggedin(true);
                                        NavigationView navigationView = getActivity().findViewById(R.id.nav_view);
                                        Menu menu = navigationView.getMenu();
                                        MenuItem menuItem = menu.findItem(R.id.nav_login);
                                        menuItem.setTitle("Log out");
                                        navheader = getActivity().findViewById(R.id.navheadertext);
                                        navheader.setText("Howdy, "+userInput.getText().toString());
                                        FragmentTransaction tx = getActivity().getSupportFragmentManager().beginTransaction();
                                        tx.replace(R.id.content_frame, new RecentActivity());
                                        tx.commit();

                                    } catch (JSONException e) {
                                        hideIM();
                                        if(passInput.getText().toString().length()<4){
                                            hideIM();
                                            Snackbar.make(getView().findViewById(R.id.passInput), "Passwords must be at least 4 char long.", Snackbar.LENGTH_LONG)
                                                    .setAction("Action", null).show();
                                        }else{
                                        Snackbar.make(getView().findViewById(R.id.passInput), "User already exists.", Snackbar.LENGTH_LONG)
                                                .setAction("Action", null).show();
                                    }}
                                }
                            }
                            , new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            VolleyLog.e("Error: ", error.getMessage());
                        }
                    });
                    requestQueue.add(req);
                    hideIM();
                } else {

                    {hideIM();
                    Snackbar.make(getView().findViewById(R.id.passInput), "Passwords don't match.", Snackbar.LENGTH_LONG)
                            .setAction("Action", null).show();
                }}

            }
        });
    }

}
